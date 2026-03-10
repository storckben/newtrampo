-- Adicionar coluna dados_extras para armazenar campos específicos de cada serviço
ALTER TABLE public.agendamentos 
ADD COLUMN dados_extras JSONB DEFAULT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.agendamentos.dados_extras IS 'Armazena dados específicos de cada tipo de serviço (RGI, RENAVAM, NIT/PIS, etc.)';
