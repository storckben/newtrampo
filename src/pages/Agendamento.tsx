import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ArrowLeft, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceSpecificFields, { getServiceCategory, getExtraDataFromForm } from "@/components/ServiceSpecificFields";
import BirthDatePicker from "@/components/BirthDatePicker";
import StepProgress from "@/components/StepProgress";
import InfoBox from "@/components/InfoBox";
import { useWebNotification } from "@/hooks/useWebNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { unidadesPoupatempo, type UnidadePoupatempo } from "@/data/unidadesPoupatempo";

const serviceNames: Record<string, string> = {
  // Documentos
  "rg-primeira-via": "RG - Primeira Via",
  "rg-segunda-via": "RG - Segunda Via",
  "cnh-primeira-via": "CNH - Primeira Via",
  "cnh-renovacao": "CNH - Renovação",
  "cin-primeira-via": "CIN - Primeira Via",
  "cin-segunda-via": "CIN - Segunda Via",
  "carteira-profissional": "Carteira Profissional - Segunda Via",
  // Veículos
  "licenciamento": "Licenciamento (CRLV-e)",
  "transferencia-veiculo": "Transferência de Veículo",
  "ipva": "IPVA - Consulta e Pagamento",
  "multas": "Multas - Consulta e Recurso",
  // Energia
  "energia-segunda-via": "Energia - Segunda Via de Conta",
  "energia-titularidade": "Energia - Troca de Titularidade",
  // INSS e Trabalho
  "inss-beneficios": "INSS - Agendamento de Benefícios",
  "seguro-desemprego": "Seguro-Desemprego",
  "ctps-digital": "CTPS Digital",
  // Outros
  "outros": "Outros Serviços",
};

const horarios = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30"
];

// Schema base
const baseSchema = z.object({
  // Step 1 - Agendamento
  estado: z.string().min(1, "Selecione o estado"),
  unidade_id: z.string().min(1, "Selecione a unidade"),
  data_agendamento: z.date({ required_error: "Data do agendamento é obrigatória" }),
  horario_agendamento: z.string().min(1, "Selecione um horário"),
  // Step 2 - Dados Pessoais
  nome_completo: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (formato: 000.000.000-00)"),
  data_nascimento: z.date({ required_error: "Data de nascimento é obrigatória" }),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido (formato: (00) 00000-0000)"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido (formato: 00000-000)").optional().or(z.literal("")),
  endereco: z.string().max(200, "Endereço muito longo").optional(),
  numero: z.string().max(20, "Número muito longo").optional(),
  complemento: z.string().max(100, "Complemento muito longo").optional(),
  bairro: z.string().max(100, "Bairro muito longo").optional(),
  cidade: z.string().max(100, "Cidade muito longa").optional(),
  // Campos extras
  rgi: z.string().optional(),
  codigo_cliente: z.string().optional(),
  motivo: z.string().max(500, "Motivo muito longo").optional(),
  codigo_uc: z.string().optional(),
  instalacao: z.string().max(20).optional(),
  placa: z.string().optional(),
  renavam: z.string().optional(),
  categoria_veiculo: z.string().optional(),
  tipo_multa: z.string().optional(),
  rg_numero: z.string().optional(),
  numero_cnh: z.string().optional(),
  categoria_cnh: z.string().optional(),
  data_vencimento_cnh: z.string().optional(),
  nit_pis: z.string().optional(),
  tipo_beneficio: z.string().optional(),
  numero_beneficio: z.string().max(20).optional(),
  ctps: z.string().optional(),
  pis_pasep: z.string().optional(),
  data_demissao: z.string().optional(),
  tipo_solicitacao_ctps: z.string().optional(),
});

type FormData = z.infer<typeof baseSchema>;

function generateProtocol(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${year}${month}${day}${random}`;
}

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  return numbers.replace(/(\d{5})(\d)/, '$1-$2');
}

// Serviços 100% online que não precisam de agendamento presencial
const onlineSlugs = [
  "transferencia-veiculo", "ipva", "multas",
  "energia-segunda-via", "energia-titularidade",
  "seguro-desemprego", "ctps-digital",
  "cnh-renovacao",
];

const Agendamento = () => {
  const { servico } = useParams<{ servico: string }>();
  const navigate = useNavigate();
  const isOnline = servico ? onlineSlugs.includes(servico) : false;
  const [currentStep, setCurrentStep] = useState(isOnline ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [selectedUnidade, setSelectedUnidade] = useState<UnidadePoupatempo | null>(null);
  const [filteredUnidades, setFilteredUnidades] = useState<UnidadePoupatempo[]>([]);
  const { showNotification, requestPermission, isSupported } = useWebNotification();
  const hasRequestedPermission = useRef(false);

  const serviceName = servico ? serviceNames[servico] || "Serviço" : "Serviço";
  const serviceCategory = servico ? getServiceCategory(servico) : "padrao";

  const form = useForm<FormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      estado: "SP",
      unidade_id: "",
      horario_agendamento: "",
      nome_completo: "",
      cpf: "",
      telefone: "",
      email: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      rgi: "",
      codigo_cliente: "",
      motivo: "",
      codigo_uc: "",
      instalacao: "",
      placa: "",
      renavam: "",
      categoria_veiculo: "",
      tipo_multa: "",
      nit_pis: "",
      tipo_beneficio: "",
      numero_beneficio: "",
      ctps: "",
      pis_pasep: "",
      data_demissao: "",
      tipo_solicitacao_ctps: "",
      rg_numero: "",
      numero_cnh: "",
      categoria_cnh: "",
      data_vencimento_cnh: "",
    },
  });

  const watchEstado = form.watch("estado");
  const watchUnidade = form.watch("unidade_id");

  useEffect(() => {
    if (watchEstado) {
      const unidades = unidadesPoupatempo.filter(u => u.estado === watchEstado);
      setFilteredUnidades(unidades);
    }
  }, [watchEstado]);

  useEffect(() => {
    if (watchUnidade) {
      const unidade = unidadesPoupatempo.find(u => u.id === watchUnidade);
      setSelectedUnidade(unidade || null);
    }
  }, [watchUnidade]);

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsFetchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      // Verifica se o CEP retornou erro (CEP não existe ou é inválido)
      if (data.erro) {
        // Para CEPs de área geral, tenta buscar informações básicas
        toast.info("CEP de área geral. Preencha o endereço manualmente.", {
          description: "Este CEP não possui logradouro específico.",
        });
      } else {
        // Preenche os campos disponíveis (alguns podem estar vazios para CEPs gerais)
        if (data.logradouro) form.setValue('endereco', data.logradouro);
        if (data.bairro) form.setValue('bairro', data.bairro);
        if (data.localidade) form.setValue('cidade', data.localidade);
        
        // Se não tem logradouro, avisa o usuário
        if (!data.logradouro) {
          toast.info("CEP encontrado! Preencha o endereço completo.", {
            description: `Cidade: ${data.localidade || 'N/A'}`,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setIsFetchingCep(false);
    }
  };

  // Mostrar notificação nativa ao entrar na página (permissão já concedida na PresellPage)
  useEffect(() => {
    if (isSupported && !hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      // Notificação imediata - permissão já foi concedida no aceite dos cookies
      showNotification({
        title: "📋 Agendamento Poupatempo",
        body: "Preencha os dados corretamente para garantir seu atendimento.",
      });
    }
  }, [isSupported, showNotification]);

  const validateStep1 = () => {
    const values = form.getValues();
    if (!values.unidade_id) {
      toast.error("Selecione uma unidade de atendimento");
      return false;
    }
    if (!values.data_agendamento) {
      toast.error("Selecione a data do agendamento");
      return false;
    }
    if (!values.horario_agendamento) {
      toast.error("Selecione o horário");
      return false;
    }
    return true;
  };

  const validateStep2 = async () => {
    const values = form.getValues();
    
    // Validar campos pessoais
    if (!values.nome_completo || values.nome_completo.length < 3) {
      toast.error("Digite seu nome completo");
      return false;
    }
    if (!values.cpf || !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(values.cpf)) {
      toast.error("CPF inválido");
      return false;
    }
    if (!values.data_nascimento) {
      toast.error("Selecione sua data de nascimento");
      return false;
    }
    if (!values.telefone || !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(values.telefone)) {
      toast.error("Telefone inválido");
      return false;
    }
    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      toast.error("E-mail inválido");
      return false;
    }

    // Validação específica por categoria
    if (serviceCategory === "sabesp") {
      if (!values.rgi || values.rgi.length < 10) {
        toast.error("RGI inválido - deve ter 10 dígitos");
        return false;
      }
      if (!values.codigo_cliente || values.codigo_cliente.length < 12) {
        toast.error("Código do cliente inválido - deve ter 12 dígitos");
        return false;
      }
    }
    
    if (serviceCategory === "energia") {
      if (!values.codigo_uc || values.codigo_uc.length < 10) {
        toast.error("Código da UC inválido - deve ter 10 dígitos");
        return false;
      }
    }
    
    if (serviceCategory === "cnh") {
      if (!values.rg_numero || values.rg_numero.length < 5) {
        toast.error("RG inválido");
        return false;
      }
      if (!values.numero_cnh || values.numero_cnh.length < 11) {
        toast.error("Número da CNH inválido - deve ter 11 dígitos");
        return false;
      }
      if (!values.categoria_cnh) {
        toast.error("Selecione a categoria da CNH");
        return false;
      }
      if (!values.data_vencimento_cnh) {
        toast.error("Informe a data de vencimento da CNH");
        return false;
      }
    }

    if (serviceCategory === "veiculo") {
      if (!values.placa || values.placa.length < 7) {
        toast.error("Placa inválida");
        return false;
      }
      if (!values.renavam || values.renavam.length < 11) {
        toast.error("RENAVAM inválido - deve ter 11 dígitos");
        return false;
      }
      if (!values.categoria_veiculo) {
        toast.error("Selecione a categoria do veículo");
        return false;
      }
    }
    
    if (serviceCategory === "inss") {
      if (!values.nit_pis || values.nit_pis.replace(/\D/g, "").length < 11) {
        toast.error("NIT/PIS inválido - deve ter 11 dígitos");
        return false;
      }
      if (!values.tipo_beneficio) {
        toast.error("Selecione o tipo de benefício");
        return false;
      }
    }
    
    if (serviceCategory === "trabalho") {
      if (!values.pis_pasep || values.pis_pasep.replace(/\D/g, "").length < 11) {
        toast.error("PIS/PASEP inválido - deve ter 11 dígitos");
        return false;
      }
      if (servico === "seguro-desemprego" && !values.data_demissao) {
        toast.error("Informe a data da demissão");
        return false;
      }
      if (servico === "ctps-digital" && !values.tipo_solicitacao_ctps) {
        toast.error("Selecione o tipo de solicitação");
        return false;
      }
    }

    return true;
  };

  const goToStep2 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      
      // Notificação nativa imediata ao ir para step 2
      showNotification({
        title: "✅ Etapa 1 concluída!",
        body: "Agora preencha seus dados pessoais para continuar o agendamento.",
      });
    }
  };

  const goBack = () => {
    if (isOnline) {
      navigate("/");
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!(await validateStep2())) return;

    setIsSubmitting(true);
    const protocolo = generateProtocol();
    const dadosExtras = servico ? getExtraDataFromForm(servico, data) : null;

    try {
      const { error } = await supabase.from("agendamentos").insert({
        servico: serviceName,
        nome_completo: data.nome_completo,
        cpf: data.cpf,
        data_nascimento: format(data.data_nascimento, "yyyy-MM-dd"),
        telefone: data.telefone,
        email: data.email,
        cep: data.cep || null,
        endereco: data.endereco || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro || null,
        cidade: isOnline ? data.cidade || null : selectedUnidade?.cidade || data.cidade || null,
        estado: data.estado || null,
        data_agendamento: isOnline ? format(new Date(), "yyyy-MM-dd") : format(data.data_agendamento, "yyyy-MM-dd"),
        horario_agendamento: isOnline ? "00:00" : data.horario_agendamento,
        protocolo,
        dados_extras: isOnline ? { ...dadosExtras, tipo: "servico_online" } : dadosExtras,
      });

      if (error) throw error;

      // Notificação nativa imediata ao concluir etapa 2
      showNotification({
        title: "✅ Dados confirmados!",
        body: "Agora efetue o pagamento via PIX para garantir seu agendamento.",
      });

      // Navegar para página de pagamento
      navigate(`/pagamento/${protocolo}`, {
        state: {
          protocolo,
          serviceName,
          servicoSlug: servico,
          unidadeNome: isOnline ? "Serviço Online" : (selectedUnidade?.nome || ""),
          unidadeEndereco: isOnline ? "Processamento digital" : (selectedUnidade?.endereco || ""),
          dataAgendamento: isOnline ? format(new Date(), "yyyy-MM-dd") : format(data.data_agendamento, "yyyy-MM-dd"),
          horario: isOnline ? "Imediato" : data.horario_agendamento,
          nomeCompleto: data.nome_completo,
          cpf: data.cpf,
          email: data.email,
        }
      });
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error("Erro ao realizar agendamento", {
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Permitir agendamento a partir de hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container max-w-2xl">
          <Button
            variant="ghost"
            onClick={goBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="bg-card rounded-xl border border-border p-6 md:p-8">
            <div className="bg-primary text-primary-foreground rounded-lg p-4 mb-6 -mx-2 md:-mx-4">
              <h1 className="text-xl font-bold">{isOnline ? "Solicitação Online" : "Agendamento"}</h1>
              <p className="text-primary-foreground/80 text-sm">{serviceName}</p>
            </div>

            <StepProgress 
              currentStep={isOnline ? 1 : currentStep} 
              totalSteps={isOnline ? 2 : 3} 
              labels={isOnline ? ["Dados Pessoais", "Pagamento"] : ["Agendamento", "Dados Pessoais", "Pagamento"]}
            />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* STEP 1 - Agendamento */}
                {currentStep === 1 && (
                  <>
                    {/* Estado */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-blue-800 font-medium">
                        Estado selecionado: <span className="font-bold">{watchEstado}</span>
                      </p>
                    </div>

                    {/* Unidade */}
                    <FormField
                      control={form.control}
                      name="unidade_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Unidade Poupa Tempo*
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a unidade de atendimento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredUnidades.map((unidade) => (
                                <SelectItem key={unidade.id} value={unidade.id}>
                                  {unidade.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-blue-600">
                            {filteredUnidades.length} unidades disponíveis em {watchEstado}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Endereço da unidade selecionada */}
                    {selectedUnidade && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">{selectedUnidade.nome}</p>
                            <p className="text-sm text-muted-foreground">{selectedUnidade.endereco}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Data e Horário */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="data_agendamento"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data do Atendimento*</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                    ) : (
                                      <span>Selecione a data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < today}
                                  className="pointer-events-auto"
                                  locale={ptBR}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="horario_agendamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {horarios.map((horario) => (
                                  <SelectItem key={horario} value={horario}>
                                    {horario}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <InfoBox
                      title="Documentos necessários:"
                      items={[
                        "Documento de identificação com foto (RG ou CNH)",
                        "CPF (original)",
                        "Comprovante de residência atualizado",
                        "Documentos específicos do serviço solicitado"
                      ]}
                    />

                    <Button 
                      type="button" 
                      onClick={goToStep2}
                      className="w-full"
                    >
                      Próximo Passo
                    </Button>
                  </>
                )}

                {/* STEP 2 - Dados Pessoais */}
                {currentStep === 2 && (
                  <>
                    <div className="space-y-4">
                      {/* Nome Completo */}
                      <FormField
                        control={form.control}
                        name="nome_completo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo*</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* CPF e Data de Nascimento */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="000.000.000-00"
                                  {...field}
                                  onChange={(e) => field.onChange(formatCPF(e.target.value))}
                                  maxLength={14}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="data_nascimento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Nascimento*</FormLabel>
                              <FormControl>
                                <BirthDatePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Telefone e Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="(00) 00000-0000"
                                  {...field}
                                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                                  maxLength={15}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail*</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="seu@email.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* CEP e Endereço */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="cep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="00000-000"
                                    {...field}
                                    onChange={(e) => {
                                      const formatted = formatCEP(e.target.value);
                                      field.onChange(formatted);
                                      // Busca automática quando CEP está completo
                                      if (formatted.length === 9) {
                                        fetchAddressByCep(formatted);
                                      }
                                    }}
                                    maxLength={9}
                                    disabled={isFetchingCep}
                                  />
                                  {isFetchingCep && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endereco"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input placeholder="Rua, Avenida..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Número, Complemento, Bairro */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="numero"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input placeholder="Nº" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="complemento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento</FormLabel>
                              <FormControl>
                                <Input placeholder="Apto, Bloco..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bairro"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro</FormLabel>
                              <FormControl>
                                <Input placeholder="Bairro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Campos específicos do serviço */}
                      {servico && (
                        <div className="pt-4 border-t">
                          <h3 className="font-medium text-foreground mb-4">
                            Dados específicos do serviço
                          </h3>
                          <ServiceSpecificFields servico={servico} form={form} />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          "Continuar para Pagamento"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Agendamento;
