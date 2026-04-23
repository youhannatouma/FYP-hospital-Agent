import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import apiClient from "@/lib/api-client";

export function useNotifications() {
  const { isLoaded, isSignedIn } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get("/notifications/");
      setNotifications(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/notifications/read-all");
      // Update local state
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isLoaded, isSignedIn]);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
