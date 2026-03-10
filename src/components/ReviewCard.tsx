import { Star } from "lucide-react";

interface ReviewCardProps {
  name: string;
  service: string;
  date: string;
  review: string;
  rating?: number;
}

const ReviewCard = ({ name, service, date, review, rating = 5 }: ReviewCardProps) => {
  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
            }`}
          />
        ))}
      </div>
      
      <p className="text-muted-foreground text-sm mb-4 italic">
        "{review}"
      </p>
      
      <div className="border-t border-border pt-4">
        <h4 className="font-semibold text-foreground">{name}</h4>
        <p className="text-xs text-muted-foreground">{service}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
