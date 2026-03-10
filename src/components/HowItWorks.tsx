import StepCard from "./StepCard";

const steps = [
  {
    number: 1,
    title: "Escolha o Serviço",
    description: "Selecione o tipo de documento que você precisa entre nossos serviços e documentos disponíveis"
  },
  {
    number: 2,
    title: "Preencha os Dados",
    description: "Insira suas informações pessoais, data e horário que deseja realizar o atendimento"
  },
  {
    number: 3,
    title: "Compareça no Local",
    description: "Vá até a unidade escolhida na data agendada com os documentos necessários"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container">
        <h2 className="text-2xl font-bold text-center text-foreground mb-10">
          Como solicitar o agendamento online?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
