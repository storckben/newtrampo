import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ProcessingModalProps {
  open: boolean;
  title?: string;
  description?: string;
}

const ProcessingModal = ({ open, title = "Processando Pagamento", description = "Gerando sua guia de pagamento PIX..." }: ProcessingModalProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingModal;
