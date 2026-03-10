import { Star } from "lucide-react";
import ReviewCard from "./ReviewCard";

const reviews = [
  {
    name: "Maria Silva",
    service: "RG Segunda Via",
    date: "14/05/2024",
    review: "Excelente serviço! Consegui agendar meu RG de forma muito rápida e fácil. O atendimento foi perfeito e não precisei enfrentar filas.",
    rating: 5
  },
  {
    name: "João Santos",
    service: "RG Primeira Via",
    date: "09/05/2024",
    review: "Muito prático e eficiente. A plataforma é intuitiva e o processo todo foi muito simples. Recomendo para todos!",
    rating: 5
  },
  {
    name: "Ana Costa",
    service: "RG Segunda Via",
    date: "07/05/2024",
    review: "Ótima experiência! Economizei muito tempo com o agendamento online. O único ponto é que gostaria de mais horários disponíveis.",
    rating: 4
  },
  {
    name: "Carlos Oliveira",
    service: "RG Primeira Via",
    date: "04/05/2024",
    review: "Fantástico! Nunca pensei que seria tão fácil agendar serviços públicos. A tecnologia realmente facilitou muito minha vida.",
    rating: 5
  },
  {
    name: "Lucia Ferreira",
    service: "RG Segunda Via",
    date: "01/05/2024",
    review: "Serviço impecável. Desde o agendamento até o atendimento, tudo funcionou perfeitamente. Muito obrigada pela praticidade!",
    rating: 5
  },
  {
    name: "Roberto Lima",
    service: "RG Primeira Via",
    date: "27/04/2024",
    review: "Muito bom! O sistema é bem organizado e consegui resolver minha pendência rapidamente. Continuem assim!",
    rating: 5
  }
];

const Reviews = () => {
  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">
          O que nossos clientes dizem
        </h2>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(Number(averageRating)) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="font-semibold text-foreground">{averageRating} de 5</span>
          <span className="text-muted-foreground">({reviews.length} avaliações)</span>
        </div>
        
        <p className="text-center text-muted-foreground mb-10">
          Milhares de pessoas já utilizaram nossos serviços de agendamento
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <ReviewCard key={index} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
