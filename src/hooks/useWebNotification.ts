import { useCallback, useEffect, useState } from "react";
import govLogo from "@/assets/gov-logo.png";

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export const useWebNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("Este navegador não suporta notificações");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      return false;
    }
  }, []);

  const showNotification = useCallback(
    async ({ title, body, icon, tag, requireInteraction }: NotificationOptions) => {
      if (!("Notification" in window)) {
        console.log("Este navegador não suporta notificações");
        return null;
      }

      // Se não tiver permissão, tenta solicitar
      if (Notification.permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) {
          console.log("Permissão negada para notificações");
          return null;
        }
      }

      try {
        const notification = new Notification(title, {
          body,
          icon: icon || govLogo,
          tag,
          requireInteraction: requireInteraction || false,
        });

        return notification;
      } catch (error) {
        console.error("Erro ao criar notificação:", error);
        return null;
      }
    },
    [requestPermission]
  );

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
};
