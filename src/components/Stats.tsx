import { Layers, Smartphone, Home, Building2, MapPin, Monitor } from "lucide-react";

const stats = [
  { value: "8242", label: "Total de serviços prestados", icon: Layers },
  { value: "1041", label: "Serviços digitais", icon: Smartphone },
  { value: "2474", label: "Serviços digitais e presenciais", icon: Home },
  { value: "727", label: "Serviços presenciais", icon: Building2 },
  { value: "1240", label: "Postos de atendimento", icon: MapPin },
  { value: "1900", label: "Totens de autoatendimento", icon: Monitor },
];

const Stats = () => {
  return (
    <section className="py-14 relative overflow-hidden" style={{ background: '#111111' }}>
      {/* Chevron / arrow pattern background */}
      <div className="absolute inset-0 opacity-[0.08]">
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="flex justify-center" style={{ marginTop: row === 0 ? 0 : -20 }}>
            {Array.from({ length: 12 }).map((_, col) => (
              <div
                key={col}
                className="w-20 h-20 border-2 border-white/30 transform rotate-45 mx-1"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="container relative z-10">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-10 text-white">
          Dados e estatísticas
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center flex flex-col items-center gap-2">
                <div className="bg-destructive rounded-lg p-2.5 mb-1">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 leading-tight">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
