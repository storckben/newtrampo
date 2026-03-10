import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYNCPAY_BASE_URL = 'https://api.syncpayments.com.br';

interface PixRequest {
  amount: number;
  protocolo: string;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  servico: string;
}

interface PixResponse {
  success: boolean;
  qrCode?: string;
  pixCopiaECola?: string;
  transactionId?: string;
  error?: string;
}

// Cache do token em memória (válido por 1h, renovamos com margem)
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getSyncPayToken(): Promise<string> {
  const now = Date.now();
  // Renovar com 5min de margem
  if (cachedToken && tokenExpiresAt > now + 5 * 60 * 1000) {
    return cachedToken;
  }

  const clientId = Deno.env.get('SYNCPAY_CLIENT_ID');
  const clientSecret = Deno.env.get('SYNCPAY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('SYNCPAY_CLIENT_ID ou SYNCPAY_CLIENT_SECRET não configurados');
  }

  console.log('Gerando novo token SyncPay...');
  const response = await fetch(`${SYNCPAY_BASE_URL}/api/partner/v1/auth-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('Erro ao gerar token SyncPay:', response.status, responseText);
    throw new Error(`Erro de autenticação SyncPay: ${response.status}`);
  }

  const data = JSON.parse(responseText);
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in || 3600) * 1000;
  console.log('Token SyncPay gerado com sucesso');
  return cachedToken!;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: PixRequest = await req.json();
    console.log('Gerando PIX via SyncPay para:', { protocolo: body.protocolo, amount: body.amount, servico: body.servico });

    // Obter token de autenticação
    const token = await getSyncPayToken();

    // Remover formatação do CPF (apenas dígitos)
    const cpfDigits = body.cpf.replace(/\D/g, '');

    // Chamar endpoint de CashIn da SyncPay
    const response = await fetch(`${SYNCPAY_BASE_URL}/api/partner/v1/cash-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: body.amount,
        description: `${body.servico} - Protocolo ${body.protocolo}`,
        client: {
          name: body.nome,
          cpf: cpfDigits,
          email: body.email || 'naoinfomado@email.com',
          phone: body.telefone?.replace(/\D/g, '') || '00000000000',
        },
      }),
    });

    const responseText = await response.text();
    console.log('Resposta SyncPay:', response.status, responseText);

    if (!response.ok) {
      console.error('Erro SyncPay:', response.status, responseText);

      await supabase.from('pix_transactions').insert({
        protocolo: body.protocolo,
        amount: body.amount,
        servico: body.servico,
        status: 'error',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      // Se token expirou, limpar cache para próxima tentativa
      if (response.status === 401) {
        cachedToken = null;
        tokenExpiresAt = 0;
      }

      return new Response(
        JSON.stringify({ success: false, error: `Erro ao gerar PIX: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Erro ao parsear resposta:', responseText);
      return new Response(
        JSON.stringify({ success: false, error: 'Resposta inválida do servidor de pagamento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SyncPay retorna: { message, pix_code, identifier }
    const transactionId = data.identifier || Math.random().toString(36).substr(2, 9).toUpperCase();
    const pixCode = data.pix_code || '';
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    console.log('PIX gerado com sucesso via SyncPay:', { transactionId, hasPixCode: !!pixCode });

    // Salvar transação no banco
    const { error: dbError } = await supabase.from('pix_transactions').insert({
      protocolo: body.protocolo,
      amount: body.amount,
      servico: body.servico,
      transaction_id: transactionId,
      status: 'pending',
      expires_at: expiresAt,
    });

    if (dbError) {
      console.error('Erro ao salvar transação no banco:', dbError);
    } else {
      console.log('Transação salva no banco com sucesso');
    }

    // SyncPay retorna pix_code que serve como copia-e-cola E QR Code
    // O pix_code é um BRCode que pode ser renderizado como QR Code no frontend
    const pixResponse: PixResponse = {
      success: true,
      qrCode: null, // SyncPay não retorna imagem de QR, gerar no frontend
      pixCopiaECola: pixCode,
      transactionId: transactionId,
    };

    return new Response(
      JSON.stringify(pixResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro interno:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno ao processar pagamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
