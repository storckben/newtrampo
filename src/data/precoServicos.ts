// Preços dos serviços em R$ - Valores Poupatempo SP
export const precoServicos: Record<string, number> = {
  // Documentos - RG/CIN
  "rg-primeira-via": 52.00,
  "rg-segunda-via": 74.00,
  "cin-primeira-via": 52.00,
  "cin-segunda-via": 74.00,
  
  // CNH
  "cnh-primeira-via": 147.75,
  "cnh-renovacao": 127.50,
  
  // Outros documentos
  "carteira-profissional": 89.00,
  
  // Veículos
  "licenciamento": 174.06,
  "transferencia-veiculo": 147.75,
  "ipva": 74.00,
  "multas": 63.00,
  
  // SABESP
  "sabesp-segunda-via": 45.00,
  "sabesp-religacao": 45.00,
  "sabesp-titularidade": 45.00,
  
  // Energia
  "energia-segunda-via": 45.00,
  "energia-titularidade": 45.00,
  
  // INSS e Trabalho
  "inss-beneficios": 63.00,
  "seguro-desemprego": 52.00,
  "ctps-digital": 52.00,
  
  // Outros
  "outros": 74.00,
};

export const getPrecoServico = (slug: string): number => {
  return precoServicos[slug] ?? 74.00;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
