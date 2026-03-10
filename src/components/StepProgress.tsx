import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const StepProgress = ({ currentStep, totalSteps, labels }: StepProgressProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                {labels && labels[i] && (
                  <span
                    className={cn(
                      "text-xs mt-2 text-center max-w-[80px]",
                      isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                    )}
                  >
                    {labels[i]}
                  </span>
                )}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all duration-300",
                    currentStep > stepNumber ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
