import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import apiClient from "@/lib/api-client";

export function useMyAppointments() {
  const { isLoaded, isSignedIn } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get("/appointments/my");
      setAppointments(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [isLoaded, isSignedIn]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
  };
}

export function useDoctorAppointments() {
  const { isLoaded, isSignedIn } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get("/appointments/doctor");
      setAppointments(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [isLoaded, isSignedIn]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
  };
}
