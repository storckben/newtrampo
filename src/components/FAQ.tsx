import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Como faço para agendar um serviço?",
    answer: "Para agendar um serviço, basta selecionar o tipo de documento desejado na seção de serviços, preencher seus dados pessoais e escolher a data e horário disponíveis. Você receberá uma confirmação por e-mail."
  },
  {
    question: "Posso cancelar ou remarcar meu agendamento?",
    answer: "Sim, você pode cancelar ou remarcar seu agendamento a qualquer momento através do link enviado no e-mail de confirmação ou acessando a área de agendamentos do portal."
  },
  {
    question: "Posso agendar para outras pessoas?",
    answer: "Sim, é possível realizar agendamentos para terceiros. Basta informar os dados da pessoa que será atendida no momento do agendamento."
  },
  {
    question: "Atendem pessoas com necessidades especiais?",
    answer: "Sim, todas as nossas unidades possuem acessibilidade e atendimento prioritário para pessoas com necessidades especiais."
  },
  {
    question: "Como entro em contato se tiver problemas?",
    answer: "Você pode entrar em contato através do nosso chat online, e-mail de suporte ou telefone disponíveis no rodapé do site."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container max-w-3xl">
        <h2 className="text-2xl font-bold text-center text-foreground mb-8">
          Dúvidas Frequentes
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-foreground hover:text-primary">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
