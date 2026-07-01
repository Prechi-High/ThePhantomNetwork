"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: "success" | "warning" | "danger" | "info" | "like" | "steal" | "revive";
  title: string;
  message?: string;
  duration?: number;
}

interface FloatingNotificationProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function FloatingNotification({ notifications, onDismiss }: FloatingNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-xs w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300);
    }, notification.duration || 4000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss, notification.duration]);

  const variants = {
    success: "bg-phantom-success/20 border border-phantom-success/30 text-phantom-success",
    warning: "bg-phantom-gold/20 border border-phantom-gold/30 text-phantom-gold",
    danger: "bg-phantom-danger/20 border border-phantom-danger/30 text-phantom-danger",
    info: "bg-phantom-border/50 border border-phantom-border text-phantom-text",
    like: "bg-phantom-gold/20 border border-phantom-gold/30 text-phantom-gold",
    steal: "bg-phantom-danger/20 border border-phantom-danger/30 text-phantom-danger",
    revive: "bg-phantom-success/20 border border-phantom-success/30 text-phantom-success",
  };

  return (
    <div
      className={cn(
        "rounded-lg p-4 shadow-lg transition-all duration-300 transform",
        variants[notification.type],
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      )}
    >
      <p className="font-semibold text-sm">{notification.title}</p>
      {notification.message && (
        <p className="text-xs mt-1 opacity-80">{notification.message}</p>
      )}
    </div>
  );
}
