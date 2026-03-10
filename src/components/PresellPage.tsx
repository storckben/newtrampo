import { useState } from "react";
import { Cookie, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebNotification } from "@/hooks/useWebNotification";
import PrivacyPolicyDialog from "@/components/PrivacyPolicyDialog";
import TermsOfUseDialog from "@/components/TermsOfUseDialog";

interface PresellPageProps {
  onAccept: () => void;
}

const PresellPage = ({ onAccept }: PresellPageProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const { requestPermission, showNotification, isSupported } = useWebNotification();

  const handleAccept = async () => {
    setIsAccepting(true);
    localStorage.setItem("cookiesAccepted", "true");

    if (isSupported) {
      const granted = await requestPermission();
      if (granted) {
        showNotification({
          title: "🎉 Bem-vindo ao Agiliza Mais!",
          body: "Escolha o serviço desejado e agende seu atendimento em poucos minutos.",
        });
      }
    }

    setTimeout(() => {
      onAccept();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 mb-6 bg-white rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-500">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
            <Cookie className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Utilizamos cookies 🍪
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Usamos cookies para melhorar sua experiência, personalizar conteúdo e garantir a segurança dos seus dados. Ao continuar, você concorda com nossa{" "}
              <button
                onClick={() => setPrivacyOpen(true)}
                className="text-primary font-medium hover:underline"
              >
                Política de Privacidade
              </button>{" "}
              e{" "}
              <button
                onClick={() => setTermsOpen(true)}
                className="text-primary font-medium hover:underline"
              >
                Termos de Uso
              </button>.
            </p>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAccept}
                disabled={isAccepting}
                className="px-6"
              >
                {isAccepting ? "Carregando..." : "Aceitar cookies"}
              </Button>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Shield className="h-3 w-3" />
                <span>Dados protegidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PrivacyPolicyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <TermsOfUseDialog open={termsOpen} onOpenChange={setTermsOpen} />
    </div>
  );
};

export default PresellPage;
