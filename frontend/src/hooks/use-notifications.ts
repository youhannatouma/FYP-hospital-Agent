"use client";

/**
 * useNotifications Hook
 * Follows: Single Responsibility Principle (SRP) — manages only notification state
 * Follows: Dependency Inversion Principle (DIP) — uses INotificationRepository via container
 * Follows: Interface Segregation Principle (ISP) — exposes only what consumers need
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getServiceContainer } from "@/lib/services/service-container";
import { Notification } from "@/lib/services/repositories/notification-repository";

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  refetch: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { isLoaded, isSignedIn } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.notification.getNotifications();
      setNotifications(data || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const container = getServiceContainer();
      await container.notification.markAsRead(notificationId);
      // Optimistic update — no network re-fetch needed
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err: any) {
      console.error("[useNotifications] Failed to mark as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const container = getServiceContainer();
      await container.notification.markAllAsRead();
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err: any) {
      console.error("[useNotifications] Failed to mark all as read:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
