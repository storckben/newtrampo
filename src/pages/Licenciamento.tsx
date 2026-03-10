import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Loader2, Car, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/data/precoServicos";

const PRECO_LICENCIAMENTO = 174.06;

const formSchema = z.object({
  placa: z.string().min(7, "Placa inválida").max(7, "Placa inválida"),
  renavam: z.string().length(11, "RENAVAM deve ter 11 dígitos"),
  nome_completo: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  data_nascimento: z.date({ required_error: "Data de nascimento obrigatória" }),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
});

type FormData = z.infer<typeof formSchema>;

function generateProtocol(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LIC${year}${month}${day}${random}`;
}

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatPlaca(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}

function formatRenavam(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

const Licenciamento = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification, requestPermission, isSupported } = useWebNotification();
  const hasRequestedPermission = useRef(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placa: "",
      renavam: "",
      nome_completo: "",
      cpf: "",
      telefone: "",
      email: "",
    },
  });

  // Mostrar notificação nativa ao entrar (permissão já concedida na PresellPage)
  useEffect(() => {
    if (isSupported && !hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      showNotification({
        title: "🚗 Licenciamento CRLV-e",
        body: "Informe os dados do veículo para gerar sua guia de pagamento.",
      });
    }
  }, [isSupported, showNotification]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const protocolo = generateProtocol();

    try {
      const { error } = await supabase.from("agendamentos").insert({
        servico: "Licenciamento (CRLV-e)",
        nome_completo: data.nome_completo,
        cpf: data.cpf,
        data_nascimento: format(data.data_nascimento, "yyyy-MM-dd"),
        telefone: data.telefone,
        email: data.email,
        data_agendamento: format(new Date(), "yyyy-MM-dd"), // Data atual (não é agendamento)
        horario_agendamento: "00:00", // Placeholder
        protocolo,
        dados_extras: {
          placa: data.placa,
          renavam: data.renavam,
          tipo: "licenciamento_direto",
        },
      });

      if (error) throw error;

      showNotification({
        title: "✅ Dados confirmados!",
        body: "Agora efetue o pagamento via PIX para gerar seu CRLV-e.",
      });

      navigate(`/pagamento/${protocolo}`, {
        state: {
          protocolo,
          serviceName: "Licenciamento (CRLV-e)",
          servicoSlug: "licenciamento",
          unidadeNome: "Emissão Digital",
          unidadeEndereco: "Documento emitido eletronicamente",
          dataAgendamento: format(new Date(), "yyyy-MM-dd"),
          horario: "Imediato",
          nomeCompleto: data.nome_completo,
          cpf: data.cpf,
          email: data.email,
        },
      });
    } catch (error) {
      console.error("Erro ao processar:", error);
      toast.error("Erro ao processar solicitação", {
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container max-w-2xl">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="bg-card rounded-xl border border-border p-6 md:p-8">
            <div className="bg-primary text-primary-foreground rounded-lg p-4 mb-6 -mx-2 md:-mx-4">
              <div className="flex items-center gap-3">
                <Car className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-bold">Licenciamento CRLV-e</h1>
                  <p className="text-primary-foreground/80 text-sm">
                    Emissão do documento digital do veículo
                  </p>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Licenciamento Anual - SP
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Emissão imediata após confirmação do pagamento</li>
                <li>✓ Documento digital válido em todo território nacional</li>
                <li>✓ Enviado por e-mail e disponível no app CDT</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-lg font-bold text-blue-900">
                  Taxa: {formatCurrency(PRECO_LICENCIAMENTO)}
                </p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Dados do Veículo */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Dados do Veículo
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="placa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placa do Veículo *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ABC1D23"
                              {...field}
                              onChange={(e) =>
                                field.onChange(formatPlaca(e.target.value))
                              }
                              maxLength={7}
                              className="uppercase"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="renavam"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RENAVAM *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00000000000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(formatRenavam(e.target.value))
                              }
                              maxLength={11}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Dados Pessoais */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-medium text-foreground">
                    Dados do Proprietário
                  </h3>

                  <FormField
                    control={form.control}
                    name="nome_completo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(formatCPF(e.target.value))
                              }
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
                          <FormLabel>Data de Nascimento *</FormLabel>
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
                                locale={ptBR}
                                captionLayout="dropdown-buttons"
                                fromYear={1920}
                                toYear={currentYear}
                                defaultMonth={new Date(1990, 0, 1)}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1920-01-01")
                                }
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(formatPhone(e.target.value))
                              }
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
                          <FormLabel>E-mail *</FormLabel>
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
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>Gerar PIX - {formatCurrency(PRECO_LICENCIAMENTO)}</>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Licenciamento;
