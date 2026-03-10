-- Tabela para rastrear PIX gerados
CREATE TABLE public.pix_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  servico TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.pix_transactions ENABLE ROW LEVEL SECURITY;

-- Política: leitura pública por protocolo (para consultar status)
CREATE POLICY "Anyone can read pix transactions by protocol"
  ON public.pix_transactions
  FOR SELECT
  USING (true);

-- Política: inserção via service role (edge function)
CREATE POLICY "Service role can insert pix transactions"
  ON public.pix_transactions
  FOR INSERT
  WITH CHECK (true);

-- Política: atualização via service role
CREATE POLICY "Service role can update pix transactions"
  ON public.pix_transactions
  FOR UPDATE
  USING (true);

-- Índice para busca por protocolo
CREATE INDEX idx_pix_transactions_protocolo ON public.pix_transactions(protocolo);

-- Índice para busca por data
CREATE INDEX idx_pix_transactions_created_at ON public.pix_transactions(created_at);