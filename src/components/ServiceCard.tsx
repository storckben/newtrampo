import { ChevronRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  actionLabel?: string;
  onClick?: () => void;
}

const ServiceCard = ({ title, description, badge, badgeColor = "bg-primary/10 text-primary", actionLabel = "Agendar", onClick }: ServiceCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left p-5 bg-card rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[160px]"
    >
      <div>
        {badge && (
          <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-3 ${badgeColor}`}>
            {badge}
          </span>
        )}
        <h3 className="font-semibold text-foreground text-[15px] leading-snug mb-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-1 mt-4 text-primary font-medium text-sm group-hover:gap-2 transition-all">
        {actionLabel}
        <ChevronRight className="h-4 w-4" />
      </div>
    </button>
  );
};

export default ServiceCard;
