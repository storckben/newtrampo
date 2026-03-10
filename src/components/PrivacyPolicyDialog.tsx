import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyDialog = ({ open, onOpenChange }: PrivacyPolicyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Política de Privacidade</DialogTitle>
          <DialogDescription>
            Última atualização: Janeiro de 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Informações que Coletamos</h3>
              <p>
                Coletamos informações pessoais que você nos fornece diretamente, incluindo nome completo, 
                CPF, data de nascimento, endereço, e-mail e telefone para processamento do seu agendamento.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Uso das Informações</h3>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Processar e confirmar seu agendamento</li>
                <li>Enviar notificações sobre o status do serviço</li>
                <li>Entrar em contato quando necessário</li>
                <li>Melhorar nossos serviços</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Proteção de Dados</h3>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas 
                informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Compartilhamento de Dados</h3>
              <p>
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros 
                para fins de marketing. Podemos compartilhar dados apenas quando necessário para 
                a prestação do serviço solicitado.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Cookies</h3>
              <p>
                Utilizamos cookies para melhorar sua experiência de navegação, lembrar suas 
                preferências e coletar informações analíticas sobre o uso do site.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Seus Direitos</h3>
              <p>Você tem direito a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar seu consentimento</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">7. Contato</h3>
              <p>
                Para dúvidas sobre esta política ou sobre o tratamento de seus dados, 
                entre em contato conosco através dos canais disponíveis no site.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyDialog;
