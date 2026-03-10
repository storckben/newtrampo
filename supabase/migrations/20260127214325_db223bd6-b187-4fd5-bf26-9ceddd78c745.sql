-- Create table for service appointments
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  servico TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  data_agendamento DATE NOT NULL,
  horario_agendamento TEXT NOT NULL,
  protocolo TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public insert, no auth required for this gov service clone)
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public service)
CREATE POLICY "Anyone can create appointments" 
ON public.agendamentos 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read their own appointment by protocol
CREATE POLICY "Anyone can read by protocol" 
ON public.agendamentos 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agendamentos_updated_at
BEFORE UPDATE ON public.agendamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();