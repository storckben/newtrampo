import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ServiceSpecificFieldsProps {
  servico: string;
  form: UseFormReturn<any>;
}

// Funções de formatação
const formatRGI = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 10);
};

const formatCodigoCliente = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 12);
};

const formatCodigoUC = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 10);
};

const formatPlaca = (value: string) => {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length <= 3) {
    return cleaned;
  }
  // Formato Mercosul: ABC1D23 ou antigo: ABC-1234
  if (cleaned.length <= 7) {
    return cleaned.slice(0, 3) + cleaned.slice(3);
  }
  return cleaned.slice(0, 7);
};

const formatRenavam = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 11);
};

const formatNitPis = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 8) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 10)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 8)}.${numbers.slice(8)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 8)}.${numbers.slice(8, 10)}-${numbers.slice(10)}`;
};

const formatCTPS = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 8);
};

// Categorias de serviços
const isSabespService = (servico: string) =>
  servico.startsWith("sabesp-");

const isEnergiaService = (servico: string) =>
  servico.startsWith("energia-");

const isVeiculoService = (servico: string) =>
  ["transferencia-veiculo", "ipva", "multas"].includes(servico);

const isLicenciamentoService = (servico: string) =>
  servico === "licenciamento";

const isInssService = (servico: string) =>
  servico === "inss-beneficios";

const isTrabalhoService = (servico: string) =>
  ["seguro-desemprego", "ctps-digital"].includes(servico);

const isCnhService = (servico: string) =>
  ["cnh-primeira-via", "cnh-renovacao"].includes(servico);

const formatNumeroCNH = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 11);
};

const ServiceSpecificFields = ({ servico, form }: ServiceSpecificFieldsProps) => {
  // Campos CNH
  if (isCnhService(servico)) {
    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-medium text-foreground">Informações Adicionais</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="rg_numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RG *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite seu RG"
                    {...field}
                    maxLength={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numero_cnh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da CNH *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o número da CNH"
                    {...field}
                    onChange={(e) => field.onChange(formatNumeroCNH(e.target.value))}
                    maxLength={11}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="categoria_cnh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">A - Moto</SelectItem>
                    <SelectItem value="B">B - Carro</SelectItem>
                    <SelectItem value="AB">AB - Moto e Carro</SelectItem>
                    <SelectItem value="C">C - Caminhão</SelectItem>
                    <SelectItem value="D">D - Ônibus</SelectItem>
                    <SelectItem value="E">E - Veículo articulado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data_vencimento_cnh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento da CNH Atual *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    placeholder="Informe a data de vencimento"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  }

  // Campos SABESP
  if (isSabespService(servico)) {
    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-medium text-foreground">Dados SABESP</h3>
        
        <FormField
          control={form.control}
          name="rgi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RGI (Código do Hidrômetro) *</FormLabel>
              <FormControl>
                <Input
                  placeholder="0000000000"
                  {...field}
                  onChange={(e) => field.onChange(formatRGI(e.target.value))}
                  maxLength={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="codigo_cliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código do Cliente *</FormLabel>
              <FormControl>
                <Input
                  placeholder="000000000000"
                  {...field}
                  onChange={(e) => field.onChange(formatCodigoCliente(e.target.value))}
                  maxLength={12}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(servico === "sabesp-religacao" || servico === "sabesp-titularidade") && (
          <FormField
            control={form.control}
            name="motivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo da Solicitação</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o motivo da solicitação..."
                    {...field}
                    maxLength={500}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    );
  }

  // Campos Energia Elétrica
  if (isEnergiaService(servico)) {
    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-medium text-foreground">Dados da Conta de Energia</h3>
        
        <FormField
          control={form.control}
          name="codigo_uc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código da Unidade Consumidora *</FormLabel>
              <FormControl>
                <Input
                  placeholder="0000000000"
                  {...field}
                  onChange={(e) => field.onChange(formatCodigoUC(e.target.value))}
                  maxLength={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instalacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número da Instalação</FormLabel>
              <FormControl>
                <Input
                  placeholder="Número da instalação"
                  {...field}
                  maxLength={20}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {servico === "energia-titularidade" && (
          <FormField
            control={form.control}
            name="motivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo da Troca de Titularidade</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o motivo..."
                    {...field}
                    maxLength={500}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    );
  }

  // Campos Licenciamento (DETRAN) - apenas Placa e RENAVAM conforme site oficial
  if (isLicenciamentoService(servico)) {
    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-medium text-foreground">Dados do Veículo</h3>
        <p className="text-sm text-muted-foreground">
          Informe a placa e o RENAVAM do veículo para realizar o licenciamento anual (CRLV-e).
        </p>
        
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
                    onChange={(e) => field.onChange(formatPlaca(e.target.value))}
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
                    onChange={(e) => field.onChange(formatRenavam(e.target.value))}
                    maxLength={11}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  }

  // Campos Veiculares (DETRAN) - Transferência, IPVA, Multas
  if (isVeiculoService(servico)) {
    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-medium text-foreground">Dados do Veículo</h3>
        
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
                    onChange={(e) => field.onChange(formatPlaca(e.target.value))}
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
                    onChange={(e) => field.onChange(formatRenavam(e.target.value))}
                    maxLength={11}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoria_veiculo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria do Veículo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                  <SelectItem value="onibus">Ônibus</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {servico === "multas" && (
          <FormField
            control={form.control}
            name="tipo_multa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Solicitação *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta de Multas</SelectItem>
                    <SelectItem value="recurso">Recurso de Multa</SelectItem>
                    <SelectItem value="pagamento">Parcelamento</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    );
  }

  // Campos INSS
  if (isInssService(servico)) {
    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-medium text-foreground">Dados INSS</h3>
        
        <FormField
          control={form.control}
          name="nit_pis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NIT/PIS *</FormLabel>
              <FormControl>
                <Input
                  placeholder="000.00000.00-0"
                  {...field}
                  onChange={(e) => field.onChange(formatNitPis(e.target.value))}
                  maxLength={14}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo_beneficio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Benefício *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de benefício" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
                  <SelectItem value="auxilio-doenca">Auxílio-Doença</SelectItem>
                  <SelectItem value="pensao">Pensão por Morte</SelectItem>
                  <SelectItem value="bpc-loas">BPC/LOAS</SelectItem>
                  <SelectItem value="salario-maternidade">Salário-Maternidade</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero_beneficio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do Benefício (se já existente)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Número do benefício existente"
                  {...field}
                  maxLength={20}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  // Campos Trabalho (Seguro-Desemprego, CTPS)
  if (isTrabalhoService(servico)) {
    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-medium text-foreground">
          {servico === "seguro-desemprego" ? "Dados do Seguro-Desemprego" : "Dados da CTPS"}
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="ctps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da CTPS</FormLabel>
                <FormControl>
                  <Input
                    placeholder="00000000"
                    {...field}
                    onChange={(e) => field.onChange(formatCTPS(e.target.value))}
                    maxLength={8}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pis_pasep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIS/PASEP *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.00000.00-0"
                    {...field}
                    onChange={(e) => field.onChange(formatNitPis(e.target.value))}
                    maxLength={14}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {servico === "seguro-desemprego" && (
          <FormField
            control={form.control}
            name="data_demissao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da Demissão *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {servico === "ctps-digital" && (
          <FormField
            control={form.control}
            name="tipo_solicitacao_ctps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Solicitação *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="primeira-via">Primeira Via Digital</SelectItem>
                    <SelectItem value="atualizacao">Atualização de Dados</SelectItem>
                    <SelectItem value="consulta">Consulta de Vínculos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    );
  }

  // Serviços sem campos específicos (RG, CNH, CIN, etc.)
  return null;
};

export default ServiceSpecificFields;

// Exportar funções auxiliares para uso em validação
export const getServiceCategory = (servico: string) => {
  if (isCnhService(servico)) return "cnh";
  if (isSabespService(servico)) return "sabesp";
  if (isEnergiaService(servico)) return "energia";
  if (isLicenciamentoService(servico)) return "licenciamento";
  if (isVeiculoService(servico)) return "veiculo";
  if (isInssService(servico)) return "inss";
  if (isTrabalhoService(servico)) return "trabalho";
  return "padrao";
};

export const getExtraDataFromForm = (servico: string, formData: any) => {
  const category = getServiceCategory(servico);
  
  switch (category) {
    case "sabesp":
      return {
        rgi: formData.rgi,
        codigo_cliente: formData.codigo_cliente,
        motivo: formData.motivo,
      };
    case "energia":
      return {
        codigo_uc: formData.codigo_uc,
        instalacao: formData.instalacao,
        motivo: formData.motivo,
      };
    case "licenciamento":
      return {
        placa: formData.placa,
        renavam: formData.renavam,
      };
    case "veiculo":
      return {
        placa: formData.placa,
        renavam: formData.renavam,
        categoria_veiculo: formData.categoria_veiculo,
        tipo_multa: formData.tipo_multa,
      };
    case "inss":
      return {
        nit_pis: formData.nit_pis,
        tipo_beneficio: formData.tipo_beneficio,
        numero_beneficio: formData.numero_beneficio,
      };
    case "trabalho":
      return {
        ctps: formData.ctps,
        pis_pasep: formData.pis_pasep,
        data_demissao: formData.data_demissao,
        tipo_solicitacao_ctps: formData.tipo_solicitacao_ctps,
      };
    case "cnh":
      return {
        rg_numero: formData.rg_numero,
        numero_cnh: formData.numero_cnh,
        categoria_cnh: formData.categoria_cnh,
        data_vencimento_cnh: formData.data_vencimento_cnh,
      };
    default:
      return null;
  }
};
