import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, Calendar, Clock, User, FileText, Loader2, Droplets, Zap, Car, Building2, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useWebNotification } from "@/hooks/useWebNotification";

interface DadosExtras {
  rgi?: string;
  codigo_cliente?: string;
  motivo?: string;
  codigo_uc?: string;
  instalacao?: string;
  placa?: string;
  renavam?: string;
  categoria_veiculo?: string;
  tipo_multa?: string;
  nit_pis?: string;
  tipo_beneficio?: string;
  numero_beneficio?: string;
  ctps?: string;
  pis_pasep?: string;
  data_demissao?: string;
  tipo_solicitacao_ctps?: string;
}

interface Agendamento {
  id: string;
  servico: string;
  nome_completo: string;
  cpf: string;
  data_agendamento: string;
  horario_agendamento: string;
  protocolo: string;
  email: string;
  telefone: string;
  dados_extras?: DadosExtras;
}

const categoriasVeiculo: Record<string, string> = {
  carro: "Carro",
  moto: "Moto",
  caminhao: "Caminhão",
  onibus: "Ônibus",
  outro: "Outro",
};

const tiposMulta: Record<string, string> = {
  consulta: "Consulta de Multas",
  recurso: "Recurso de Multa",
  pagamento: "Parcelamento",
};

const tiposBeneficio: Record<string, string> = {
  aposentadoria: "Aposentadoria",
  "auxilio-doenca": "Auxílio-Doença",
  pensao: "Pensão por Morte",
  "bpc-loas": "BPC/LOAS",
  "salario-maternidade": "Salário-Maternidade",
  outro: "Outro",
};

const tiposCTPS: Record<string, string> = {
  "primeira-via": "Primeira Via Digital",
  atualizacao: "Atualização de Dados",
  consulta: "Consulta de Vínculos",
};

const getServiceCategory = (servico: string): string => {
  if (servico.includes("SABESP")) return "sabesp";
  if (servico.includes("Energia")) return "energia";
  if (servico.includes("Transferência") || servico.includes("IPVA") || servico.includes("Multas")) return "veiculo";
  if (servico.includes("INSS")) return "inss";
  if (servico.includes("Seguro-Desemprego") || servico.includes("CTPS")) return "trabalho";
  return "padrao";
};

const DadosExtrasDisplay = ({ servico, dados }: { servico: string; dados?: DadosExtras }) => {
  if (!dados) return null;

  const category = getServiceCategory(servico);

  if (category === "sabesp" && (dados.rgi || dados.codigo_cliente)) {
    return (
      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
        <Droplets className="h-5 w-5 text-blue-500 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Dados SABESP</p>
          {dados.rgi && <p className="font-medium text-foreground">RGI: {dados.rgi}</p>}
          {dados.codigo_cliente && <p className="text-sm text-muted-foreground">Código Cliente: {dados.codigo_cliente}</p>}
          {dados.motivo && <p className="text-sm text-muted-foreground mt-1">Motivo: {dados.motivo}</p>}
        </div>
      </div>
    );
  }

  if (category === "energia" && dados.codigo_uc) {
    return (
      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
        <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Dados Energia</p>
          <p className="font-medium text-foreground">Código UC: {dados.codigo_uc}</p>
          {dados.instalacao && <p className="text-sm text-muted-foreground">Instalação: {dados.instalacao}</p>}
          {dados.motivo && <p className="text-sm text-muted-foreground mt-1">Motivo: {dados.motivo}</p>}
        </div>
      </div>
    );
  }

  if (category === "veiculo" && (dados.placa || dados.renavam)) {
    return (
      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
        <Car className="h-5 w-5 text-green-500 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Dados do Veículo</p>
          {dados.placa && <p className="font-medium text-foreground">Placa: {dados.placa}</p>}
          {dados.renavam && <p className="text-sm text-muted-foreground">RENAVAM: {dados.renavam}</p>}
          {dados.categoria_veiculo && (
            <p className="text-sm text-muted-foreground">
              Categoria: {categoriasVeiculo[dados.categoria_veiculo] || dados.categoria_veiculo}
            </p>
          )}
          {dados.tipo_multa && (
            <p className="text-sm text-muted-foreground">
              Tipo: {tiposMulta[dados.tipo_multa] || dados.tipo_multa}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (category === "inss" && dados.nit_pis) {
    return (
      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
        <Building2 className="h-5 w-5 text-orange-500 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Dados INSS</p>
          <p className="font-medium text-foreground">NIT/PIS: {dados.nit_pis}</p>
          {dados.tipo_beneficio && (
            <p className="text-sm text-muted-foreground">
              Benefício: {tiposBeneficio[dados.tipo_beneficio] || dados.tipo_beneficio}
            </p>
          )}
          {dados.numero_beneficio && (
            <p className="text-sm text-muted-foreground">Nº Benefício: {dados.numero_beneficio}</p>
          )}
        </div>
      </div>
    );
  }

  if (category === "trabalho" && dados.pis_pasep) {
    return (
      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
        <Briefcase className="h-5 w-5 text-purple-500 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Dados Trabalhistas</p>
          <p className="font-medium text-foreground">PIS/PASEP: {dados.pis_pasep}</p>
          {dados.ctps && <p className="text-sm text-muted-foreground">CTPS: {dados.ctps}</p>}
          {dados.data_demissao && (
            <p className="text-sm text-muted-foreground">
              Data Demissão: {format(new Date(dados.data_demissao + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          )}
          {dados.tipo_solicitacao_ctps && (
            <p className="text-sm text-muted-foreground">
              Tipo: {tiposCTPS[dados.tipo_solicitacao_ctps] || dados.tipo_solicitacao_ctps}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

const Confirmacao = () => {
  const { protocolo } = useParams<{ protocolo: string }>();
  const navigate = useNavigate();
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification, isSupported } = useWebNotification();
  const hasShownNotification = useRef(false);

  useEffect(() => {
    const fetchAgendamento = async () => {
      if (!protocolo) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("protocolo", protocolo)
        .maybeSingle();

      if (error || !data) {
        navigate("/");
        return;
      }

      setAgendamento(data as Agendamento);
      setLoading(false);
    };

    fetchAgendamento();
  }, [protocolo, navigate]);

  // Notificação nativa ao carregar a confirmação
  useEffect(() => {
    if (!loading && agendamento && isSupported && !hasShownNotification.current) {
      hasShownNotification.current = true;
      showNotification({
        title: "✅ Agendamento Confirmado!",
        body: `Compareça na data agendada. Protocolo: ${agendamento.protocolo}`,
      });
    }
  }, [loading, agendamento, isSupported, showNotification]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agendamento) return null;

  const dataFormatada = format(new Date(agendamento.data_agendamento + "T00:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container max-w-2xl">
          <div className="bg-card rounded-xl border border-border p-6 md:p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Agendamento Confirmado!
            </h1>
            <p className="text-muted-foreground mb-6">
              Seu agendamento foi realizado com sucesso.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">
                Número do Protocolo
              </p>
              <p className="text-xl font-bold text-primary font-mono">
                {agendamento.protocolo}
              </p>
            </div>

            <div className="space-y-4 text-left mb-8">
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium text-foreground">{agendamento.servico}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium text-foreground">{agendamento.nome_completo}</p>
                  <p className="text-sm text-muted-foreground mt-1">CPF: {agendamento.cpf}</p>
                </div>
              </div>

              {/* Dados Extras do Serviço */}
              <DadosExtrasDisplay servico={agendamento.servico} dados={agendamento.dados_extras} />

              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium text-foreground">{dataFormatada}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium text-foreground">{agendamento.horario_agendamento}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Guarde o número do protocolo. Você receberá uma confirmação no e-mail {agendamento.email}. 
                Leve um documento de identificação com foto no dia do atendimento.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link to="/">Voltar ao Início</Link>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                Imprimir Comprovante
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Confirmacao;
