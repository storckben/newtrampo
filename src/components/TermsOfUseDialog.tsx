import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfUseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsOfUseDialog = ({ open, onOpenChange }: TermsOfUseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Termos de Uso</DialogTitle>
          <DialogDescription>
            Última atualização: Janeiro de 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Aceitação dos Termos</h3>
              <p>
                Ao utilizar este serviço de agendamento, você concorda com estes termos de uso. 
                Se não concordar com qualquer parte destes termos, não utilize nosso serviço.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Descrição do Serviço</h3>
              <p>
                Este é um serviço privado de agendamento que facilita o acesso aos serviços 
                públicos. Não somos um órgão governamental, mas sim um facilitador que cobra 
                uma taxa de conveniência pelo serviço prestado.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Taxas e Pagamentos</h3>
              <p>
                Cobramos uma taxa de agendamento pelo serviço de facilitação. Esta taxa é 
                claramente informada antes da confirmação do pagamento. Os pagamentos são 
                processados de forma segura via PIX.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Responsabilidades do Usuário</h3>
              <p>O usuário se compromete a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Fornecer informações verdadeiras e precisas</li>
                <li>Comparecer na data e horário agendados</li>
                <li>Levar os documentos necessários para o atendimento</li>
                <li>Manter seus dados de contato atualizados</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Cancelamento e Reembolso</h3>
              <p>
                Em caso de não comparecimento, a taxa de agendamento não será reembolsada. 
                Cancelamentos devem ser solicitados com antecedência mínima de 24 horas 
                para análise de reembolso.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Limitação de Responsabilidade</h3>
              <p>
                Não nos responsabilizamos por atrasos ou indisponibilidades no atendimento 
                causados por fatores externos ao nosso controle, incluindo greves, 
                problemas técnicos nos órgãos públicos ou força maior.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">7. Propriedade Intelectual</h3>
              <p>
                Todo o conteúdo deste site, incluindo textos, imagens, logos e marcas, 
                são de propriedade exclusiva e protegidos por leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">8. Modificações</h3>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                As alterações entram em vigor imediatamente após a publicação no site.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">9. Foro</h3>
              <p>
                Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer 
                questões oriundas destes termos de uso.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfUseDialog;
