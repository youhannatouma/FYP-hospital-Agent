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

  const fetchAppointments = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.appointment.getMyAppointments();
      setAppointments(data || []);
      setError(null);
    } catch (err: unknown) {
      setError(err.message || "Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
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

  const fetchAppointments = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.appointment.getDoctorAppointments();
      setAppointments(data || []);
      setError(null);
    } catch (err: unknown) {
      setError(err.message || "Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
  };
}
