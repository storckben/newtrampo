import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, MapPin, Copy, Check, Shield, Lock, Building2, Home } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InfoBox from "@/components/InfoBox";
import ProcessingModal from "@/components/ProcessingModal";
import { useWebNotification } from "@/hooks/useWebNotification";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getPrecoServico, formatCurrency } from "@/data/precoServicos";
import govLogo from "@/assets/gov-logo.png";

interface LocationState {
  protocolo: string;
  serviceName: string;
  servicoSlug: string;
  unidadeNome: string;
  unidadeEndereco: string;
  dataAgendamento: string;
  horario: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
}

const Pagamento = () => {
  const { protocolo } = useParams<{ protocolo: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [expirationTime, setExpirationTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [receberEmCasa, setReceberEmCasa] = useState(false);
  const taxaEntrega = 25.00;
  
  const { showNotification, isSupported } = useWebNotification();
  const hasShownEntryNotification = useRef(false);

  useEffect(() => {
    if (!state || !protocolo) {
      navigate("/");
    }
  }, [state, protocolo, navigate]);

  // Notificação nativa ao entrar na página de pagamento
  useEffect(() => {
    if (state && isSupported && !hasShownEntryNotification.current) {
      hasShownEntryNotification.current = true;
      showNotification({
        title: "💳 Finalize seu pagamento",
        body: "Emita a guia PIX para confirmar seu agendamento.",
      });
    }
  }, [state, isSupported, showNotification]);

  // Countdown timer
  useEffect(() => {
    if (!expirationTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = expirationTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Expirado");
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationTime]);

  if (!state) return null;

  const precoBase = getPrecoServico(state.servicoSlug);
  const preco = precoBase + (receberEmCasa ? taxaEntrega : 0);
  const dataFormatada = format(new Date(state.dataAgendamento + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR });

  const generatePix = async () => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-pix', {
        body: {
          amount: preco,
          protocolo: state.protocolo,
          nome: state.nomeCompleto,
          cpf: state.cpf,
          email: state.email,
          servico: state.serviceName,
        },
      });

      if (error) {
        console.error('Erro ao chamar edge function:', error);
        throw new Error(error.message || 'Erro ao gerar PIX');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao gerar PIX');
      }

      console.log('PIX gerado:', data);

      setPixCode(data.pixCopiaECola || '');
      setQrCodeImage(data.qrCode || null);
      setTransactionId(data.transactionId || Math.floor(Math.random() * 100000000).toString());
      setExpirationTime(addMinutes(new Date(), 30));
      setPixGenerated(true);

      // Notificação nativa de PIX gerado
      showNotification({
        title: "✅ PIX gerado com sucesso!",
        body: "Você tem 30 minutos para efetuar o pagamento.",
      });

      toast.success("PIX gerado com sucesso!", {
        description: "Você tem 30 minutos para efetuar o pagamento.",
      });
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast.error("Erro ao gerar PIX", {
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      
      showNotification({
        title: "📋 Código copiado!",
        body: "Cole no seu aplicativo de banco para realizar o pagamento.",
      });
      
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Erro ao copiar código");
    }
  };

  const handleConfirmPayment = () => {
    // Notificação nativa de confirmação
    showNotification({
      title: "🎉 Pagamento confirmado!",
      body: `Seu atendimento está agendado para ${dataFormatada} às ${state.horario}.`,
    });

    setTimeout(() => {
      navigate(`/confirmacao/${protocolo}`);
    }, 1000);
  };

  const handleGenerateNewPix = () => {
    setPixGenerated(false);
    setPixCode("");
    setQrCodeImage(null);
    setTransactionId("");
    setExpirationTime(null);
    generatePix();
  };

  // QR Code com logo no centro
  const QRCodeDisplay = () => {
    return (
      <div className="relative w-56 h-56 mx-auto bg-white p-3 rounded-xl border-2 border-border shadow-sm">
        {pixCode ? (
          <QRCodeSVG value={pixCode} size={200} level="M" />
        ) : qrCodeImage ? (
          <img src={qrCodeImage} alt="QR Code PIX" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Gerando QR Code...
          </div>
        )}
        {/* Logo SP no centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-1 rounded-lg shadow-md">
            <img src={govLogo} alt="SP" className="w-10 h-10 object-contain" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container max-w-lg">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="bg-card rounded-xl border border-border p-6 md:p-8">
            {!pixGenerated ? (
              <>
                <h1 className="text-2xl font-bold text-foreground mb-6">
                  Resumo do Pedido
                </h1>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Serviço:</span>
                    <span className="font-medium text-foreground">{state.serviceName}</span>
                  </div>

                  {/* Receber documento em casa */}
                  <div className="flex items-start space-x-3 py-3 border-b border-border">
                    <Checkbox
                      id="receber-em-casa"
                      checked={receberEmCasa}
                      onCheckedChange={(checked) => setReceberEmCasa(checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="receber-em-casa"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        <Home className="h-4 w-4 text-muted-foreground" />
                        Receber documento em casa (+{formatCurrency(taxaEntrega)})
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Este valor ao pagar. Seu documento será enviado pelos Correios informado em até 15 dias úteis após a emissão.
                      </p>
                    </div>
                  </div>

                  {receberEmCasa && (
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Taxa de entrega:</span>
                      <span className="font-medium text-foreground">{formatCurrency(taxaEntrega)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Taxa do serviço:</span>
                    <span className="font-medium text-foreground">{formatCurrency(precoBase)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-primary font-semibold">Valor Total:</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(preco)}</span>
                  </div>
                </div>

                {/* Unidade selecionada */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{state.unidadeNome}</p>
                      <p className="text-sm text-muted-foreground">{state.unidadeEndereco}</p>
                    </div>
                  </div>
                </div>

                {/* Data e horário */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-medium text-foreground">{dataFormatada}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-medium text-foreground">{state.horario}</p>
                    </div>
                  </div>
                </div>

                {/* Aviso amarelo */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Atenção:</strong> Emitir a guia e não realizar o pagamento impedirá a solicitação de novos agendamentos até que a pendência seja regularizada.
                  </p>
                </div>

                {/* Info box */}
                <InfoBox
                  title="Atenção:"
                  items={[
                    "Efetue o pagamento em até 30 minutos",
                    "Após a confirmação, você receberá um email de confirmação",
                    "Um aviso breve para lembrete será enviado no WhatsApp",
                    "Compareça no local na data agendada"
                  ]}
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/")}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={generatePix}
                  >
                    Emitir Guia de Pagamento
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <QRCodeDisplay />
                </div>

                {/* Código PIX (Copia e Cola) */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Código PIX (Copia e Cola)</p>
                  <div className="relative bg-muted/50 rounded-lg border border-border p-4">
                    <p className="font-mono text-xs break-all pr-10 leading-relaxed text-muted-foreground">
                      {pixCode}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Detalhes da Transação */}
                <div className="bg-muted/30 rounded-lg border border-border">
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Valor:</p>
                      <p className="font-bold text-foreground">{formatCurrency(preco)}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">ID da Transação:</p>
                      <p className="font-medium text-foreground text-sm">{transactionId.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Status:</p>
                      <p className="font-medium text-amber-500">Aguardando Pagamento</p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Expira em:</p>
                      <p className="font-medium text-foreground">
                        {expirationTime && format(expirationTime, "dd/MM/yyyy, HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badges de Segurança */}
                <div className="flex items-center justify-center gap-4 py-3 border-y border-border">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-medium">PIX Seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs font-medium">Criptografado</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Banco Central</span>
                  </div>
                </div>

                {/* Instruções */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Como pagar:</strong> Abra o aplicativo do seu banco, 
                    escaneie o QR Code ou copie e cole o código PIX acima para efetuar o pagamento.
                  </p>
                </div>

                {/* Botões */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full bg-muted/50 hover:bg-muted"
                    onClick={handleGenerateNewPix}
                  >
                    Gerar Novo PIX
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleConfirmPayment}
                  >
                    Finalizar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ProcessingModal open={isProcessing} />
    </div>
  );
};

export default Pagamento;
