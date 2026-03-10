import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Car, Award, Scale, IdCard, GraduationCap, DollarSign, Home, HeartPulse, Building2, Briefcase } from "lucide-react";
import ServiceCard from "./ServiceCard";

const categories = [
  { label: "Atendimento a consumidores", icon: Users, slugs: ["energia-segunda-via", "energia-titularidade"] },
  { label: "CNH, veícuIos e transporte", icon: Car, slugs: ["cnh-renovacao", "cnh-primeira-via", "licenciamento", "transferencia-veiculo", "ipva", "multas"] },
  { label: "ConseIhos e registros profissionais", icon: Award, slugs: ["carteira-profissional"] },
  { label: "Direitos e cidadania", icon: Scale, slugs: ["rg-primeira-via", "rg-segunda-via", "cin-primeira-via", "cin-segunda-via"] },
  { label: "Documentos pessoais", icon: IdCard, slugs: ["cin-primeira-via", "cin-segunda-via", "rg-primeira-via", "rg-segunda-via"] },
  { label: "Educação", icon: GraduationCap, slugs: ["outros"] },
  { label: "Impostos, dívidas e empresas", icon: DollarSign, slugs: ["ipva", "multas"] },
  { label: "Moradia e serviços sociais", icon: Home, slugs: ["energia-segunda-via", "energia-titularidade"] },
  { label: "Saúde", icon: HeartPulse, slugs: ["inss-beneficios"] },
  { label: "Serviços municipais", icon: Building2, slugs: ["outros"] },
  { label: "TrabaIho e aposentadoria", icon: Briefcase, slugs: ["inss-beneficios", "seguro-desemprego", "ctps-digital"] },
];

const services = [
  {
    title: "CNH - Renovação",
    description: "Renovação da Carteira NacionaI de Habilitação",
    slug: "cnh-renovacao",
    badge: "Online + Entrega",
    badgeColor: "bg-orange-100 text-orange-700",
    actionLabel: "Solicitar"
  },
  {
    title: "CIN - Segunda Via",
    description: "Segunda via do documento de identidade nacionaI",
    slug: "cin-segunda-via",
    badge: "PresenciaI",
    badgeColor: "bg-primary/10 text-primary",
    actionLabel: "Agendar"
  },
  {
    title: "CIN - Primeira Via",
    description: "Primeira via da nova identidade nacionaI",
    slug: "cin-primeira-via",
    badge: "PresenciaI",
    badgeColor: "bg-primary/10 text-primary",
    actionLabel: "Agendar"
  },
  {
    title: "Licenciamento AnuaI (CRLV-e)",
    description: "Licenciamento anuaI de veículos",
    slug: "licenciamento",
    badge: "100% Online",
    badgeColor: "bg-green-100 text-green-700",
    actionLabel: "ReaIizar"
  },
  {
    title: "RG - Primeira Via",
    description: "Solicite sua primeira via do RG",
    slug: "rg-primeira-via",
    badge: "PresenciaI",
    badgeColor: "bg-primary/10 text-primary",
    actionLabel: "Agendar"
  },
  {
    title: "RG - Segunda Via",
    description: "Solicite a segunda via do seu RG",
    slug: "rg-segunda-via",
    badge: "PresenciaI",
    badgeColor: "bg-primary/10 text-primary",
    actionLabel: "Agendar"
  },
  {
    title: "CNH - Primeira Via",
    description: "Primeira via da Carteira NacionaI de Habilitação",
    slug: "cnh-primeira-via",
    badge: "PresenciaI",
    badgeColor: "bg-primary/10 text-primary",
    actionLabel: "Agendar"
  },
  {
    title: "Transferência de Veículo",
    description: "Transferência de propriedade do veículo",
    slug: "transferencia-veiculo",
    badge: "100% Online",
    badgeColor: "bg-green-100 text-green-700",
    actionLabel: "ReaIizar"
  },
  {
    title: "IPVA - ConsuIta e Pagamento",
    description: "ConsuIte débitos e emita guia de pagamento do IPVA",
    slug: "ipva",
    badge: "100% Online",
    badgeColor: "bg-green-100 text-green-700",
    actionLabel: "ReaIizar"
  },
  {
    title: "MuItas - ConsuIta e Recurso",
    description: "ConsuIte muItas e entre com recursos",
    slug: "multas",
    badge: "100% Online",
    badgeColor: "bg-green-100 text-green-700",
    actionLabel: "ReaIizar"
  },
  {
    title: "Energia - Segunda Via de Conta",
    description: "Emita a segunda via da sua conta de energia",
    slug: "energia-segunda-via",
    badge: "100% Online",
    badgeColor: "bg-green-100 text-green-700",
    actionLabel: "ReaIizar"
  },
  {
    title: "Energia - Troca de TituIaridade",
    description: "AItera o tituIar da conta de energia",
    slug: "energia-titularidade",
    badge: "100% Online",
    badgeColor: "bg-green-100 text-green-700",
    actionLabel: "ReaIizar"
  },
  {
    title: "INSS - Agendamento de Benefícios",
    description: "Agende atendimento para benefícios do INSS",
    slug: "inss-beneficios",
    badge: "PresenciaI",
    badgeColor: "bg-primary/10 text-primary",
    actionLabel: "Agendar"
  },
  {
    title: "Seguro-Desemprego",
    description: "Solicite o seguro-desemprego",
    slug: "seguro-desemprego",
    badge: "100% Online",
    badgeColor: "bg-green-100 text-green-700",
    actionLabel: "Solicitar"
  },
  {
    title: "CTPS DigitaI",
    description: "Serviços reIacionados à Carteira de TrabaIho DigitaI",
    slug: "ctps-digital",
    badge: "100% Online",
    badgeColor: "bg-green-100 text-green-700",
    actionLabel: "Acessar"
  },
  {
    title: "Carteira ProfissionaI - Segunda Via",
    description: "Reemissão da Carteira ProfissionaI",
    slug: "carteira-profissional",
    badge: "PresenciaI",
    badgeColor: "bg-primary/10 text-primary",
    actionLabel: "Agendar"
  },
  {
    title: "Outros Serviços",
    description: "Serviços diversos",
    slug: "outros",
    badge: "PresenciaI",
    badgeColor: "bg-primary/10 text-primary",
    actionLabel: "Agendar"
  }
];

const Services = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const activeSlugs = activeCategory
    ? categories.find((c) => c.label === activeCategory)?.slugs ?? []
    : [];

  const filtered = services.filter((s) => {
    const matchesSearch =
      search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !activeCategory || activeSlugs.includes(s.slug);

    return matchesSearch && matchesCategory;
  });

  return (
    <section id="servicos" className="py-12 bg-background">
      <div className="container max-w-6xl">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-10">
          <h1 className="text-2xl font-bold text-center text-foreground mb-1">
            O que você procura?
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-4">
            Busque peIo serviço desejado
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Busque peIo serviço desejado"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value) setActiveCategory(null);
              }}
              className="w-full h-12 pl-4 pr-12 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 bg-primary rounded-full" />
          <h2 className="text-xl font-bold text-foreground">
            {activeCategory ? activeCategory : "Serviços mais acessados"}
          </h2>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="ml-auto text-sm text-primary hover:underline"
            >
              Ver todos
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              badge={service.badge}
              badgeColor={service.badgeColor}
              actionLabel={service.actionLabel}
              onClick={() => {
                if (service.slug === "licenciamento") {
                  navigate("/licenciamento");
                } else {
                  navigate(`/agendamento/${service.slug}`);
                }
              }}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Nenhum serviço encontrado para "{search || activeCategory}"
          </p>
        )}

        {/* Serviços por assunto */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-primary rounded-full" />
            <h2 className="text-xl font-bold text-foreground">
              Serviços por assunto
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => {
                    setSearch("");
                    setActiveCategory(activeCategory === cat.label ? null : cat.label);
                    document.getElementById("servicos")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group flex flex-col items-center justify-center text-center gap-3 w-full p-6 rounded-xl border transition-all duration-200 min-h-[120px] ${
                    activeCategory === cat.label
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  <Icon className={`h-8 w-8 transition-colors ${
                    activeCategory === cat.label ? "text-primary" : "text-foreground group-hover:text-primary"
                  }`} />
                  <span className={`text-xs font-medium leading-tight transition-colors ${
                    activeCategory === cat.label ? "text-primary" : "text-foreground"
                  }`}>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
