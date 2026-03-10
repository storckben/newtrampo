import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebNotification } from "@/hooks/useWebNotification";
import PrivacyPolicyDialog from "@/components/PrivacyPolicyDialog";

const Cookies = () => {
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
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
      navigate("/servicos");
    }, 400);
  };

  const handleReject = () => {
    navigate("/servicos");
  };

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-primary/10 rounded-lg p-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Política de Cookies</h1>
            <p className="text-xs text-muted-foreground">Transparência e controle de dados</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-4 mb-5 leading-relaxed">
          Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos para melhorar sua experiência. Seus dados são tratados com total segurança e transparência.
        </p>

        {/* Info box */}
        <div className="bg-primary/5 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🔄</span>
            <span className="text-sm font-semibold text-foreground">O que fazemos com os cookies:</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1.5 ml-6">
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5">•</span>
              <span>Melhorar a performance do site</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5">•</span>
              <span>Personalizar sua experiência</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5">•</span>
              <span>Analisar o uso para aprimoramentos</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="mt-0.5">•</span>
              <span>Garantir a segurança dos dados</span>
            </li>
          </ul>
        </div>

        {/* Privacy link */}
        <button
          onClick={() => setPrivacyOpen(true)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="underline">Leia nossa Política de Privacidade completa</span>
        </button>

        {/* Buttons */}
        <div className="flex gap-3 mb-4">
          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1"
            size="lg"
          >
            {isAccepting ? "Carregando..." : "Aceitar Cookies"}
          </Button>
          <Button
            onClick={handleReject}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Recusar
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Você pode alterar suas preferências a qualquer momento
        </p>
      </div>

      <PrivacyPolicyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </div>
  );
};

export default Cookies;
