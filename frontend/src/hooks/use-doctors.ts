import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import apiClient from "@/lib/api-client";

export function useDoctors(specialty?: string) {
  const { isLoaded, isSignedIn } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specialty) params.append("specialty", specialty);

      const res = await apiClient.get(`/doctors/?${params.toString()}`);
      setDoctors(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [isLoaded, isSignedIn, specialty]);

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctors,
  };
}

export function useDoctorById(doctorId?: string) {
  const { isLoaded, isSignedIn } = useAuth();
  const [doctor, setDoctor] = useState<any | null>(null);
  const [loading, setLoading] = useState(!!doctorId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !doctorId) {
      setLoading(false);
      return;
    }

    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/doctors/${doctorId}`);
        setDoctor(res.data || null);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch doctor");
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [isLoaded, isSignedIn, doctorId]);

  return { doctor, loading, error };
}

export function useDoctorAvailability(doctorId?: string, date?: string) {
  const { isLoaded, isSignedIn } = useAuth();
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!doctorId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !doctorId) {
      setLoading(false);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (date) params.append("date", date);

        const res = await apiClient.get(
          `/doctors/${doctorId}/slots?${params.toString()}`,
        );
        setSlots(res.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch availability");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [isLoaded, isSignedIn, doctorId, date]);

  return { slots, loading, error };
}
