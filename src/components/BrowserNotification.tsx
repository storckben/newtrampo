import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  timestamp?: string;
}

interface BrowserNotificationProps {
  notification: Notification | null;
  onClose: () => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  autoCloseDelay?: number;
}

const BrowserNotification = ({ 
  notification, 
  onClose, 
  position = "top-right",
  autoCloseDelay = 8000 
}: BrowserNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const clearAutoClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    clearAutoClose();
    setIsVisible(false);
    // Wait for CSS animation
    setTimeout(() => {
      if (isMountedRef.current) {
        setShouldRender(false);
        onClose();
      }
    }, 300);
  }, [onClose, clearAutoClose]);

  // Cleanup on unmount - critical for navigation
  useLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearAutoClose();
    };
  }, [clearAutoClose]);

  useEffect(() => {
    if (notification) {
      setShouldRender(true);
      // Small delay for enter animation
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          setIsVisible(true);
        }
      });
      
      if (autoCloseDelay > 0) {
        clearAutoClose();
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            handleClose();
          }
        }, autoCloseDelay);
      }
    } else {
      setIsVisible(false);
      setShouldRender(false);
    }
    
    return clearAutoClose;
  }, [notification, autoCloseDelay, handleClose, clearAutoClose]);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  if (!shouldRender || !notification) return null;

  return (
    <div
      className={`fixed ${positionClasses[position]} z-[100] max-w-sm w-full pointer-events-auto transition-all duration-300 ease-out ${
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 -translate-y-5 scale-95"
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Browser notification header */}
        <div className="bg-gray-100 px-3 py-2 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">SP</span>
            </div>
            <span className="text-xs text-gray-600 font-medium">Poupatempo SP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400">
              {notification.timestamp || "Agora"}
            </span>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Notification content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {notification.icon && (
              <span className="text-2xl flex-shrink-0">{notification.icon}</span>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para gerenciar notificações
export const useNotificationQueue = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);

  useEffect(() => {
    if (!current && notifications.length > 0) {
      setCurrent(notifications[0]);
      setNotifications(prev => prev.slice(1));
    }
  }, [current, notifications]);

  const addNotification = (notification: Omit<Notification, "id">) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const clearCurrent = () => {
    setCurrent(null);
  };

  return { current, addNotification, clearCurrent };
};

export default BrowserNotification;
