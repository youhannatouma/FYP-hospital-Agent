// @ts-nocheck
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getServiceContainer } from "@/lib/services/service-container";
import { Appointment } from "@/lib/services/repositories/appointment-repository";

/**
 * useMyAppointments Hook
 * Follows: Single Responsibility Principle (SRP)
 * - Only handles state and effects
 * - Delegates data fetching to AppointmentRepository
 */
export function useMyAppointments() {
  const { isLoaded, isSignedIn } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (isMounted: { current: boolean }) => {
    if (!isLoaded || !isSignedIn) {
      if (isMounted.current) setLoading(false);
      return;
    }

    if (isMounted.current) setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.appointment.getMyAppointments();
      if (isMounted.current) {
        setAppointments(data || []);
        setError(null);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "Failed to fetch appointments");
        setAppointments([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const isMounted = { current: true };
    fetchAppointments(isMounted);
    return () => {
      isMounted.current = false;
    };
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: () => fetchAppointments({ current: true }),
  };
}

/**
 * useDoctorAppointments Hook
 * Follows: Single Responsibility Principle (SRP)
 */
export function useDoctorAppointments() {
  const { isLoaded, isSignedIn } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (isMounted: { current: boolean }) => {
    if (!isLoaded || !isSignedIn) {
      if (isMounted.current) setLoading(false);
      return;
    }

    if (isMounted.current) setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.appointment.getDoctorAppointments();
      if (isMounted.current) {
        setAppointments(data || []);
        setError(null);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "Failed to fetch appointments");
        setAppointments([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const isMounted = { current: true };
    fetchAppointments(isMounted);
    return () => {
      isMounted.current = false;
    };
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: () => fetchAppointments({ current: true }),
  };
}
