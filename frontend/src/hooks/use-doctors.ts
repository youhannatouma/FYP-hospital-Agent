"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getServiceContainer } from "@/lib/services/service-container";
import {
  Doctor,
  TimeSlot,
} from "@/lib/services/repositories/doctor-repository";

/**
 * useDoctors Hook
 * Follows: Single Responsibility Principle (SRP)
 * - Only handles state and effects
 * - Delegates data fetching to DoctorRepository
 */
export function useDoctors(specialty?: string) {
  const { isLoaded, isSignedIn } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.doctor.getAvailableDoctors(specialty);
      setDoctors(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, specialty]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctors,
  };
}

/**
 * useDoctorById Hook
 * Follows: Single Responsibility Principle (SRP)
 */
export function useDoctorById(doctorId?: string) {
  const { isLoaded, isSignedIn } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
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
        const container = getServiceContainer();
        const data = await container.doctor.getDoctorById(doctorId);
        setDoctor(data || null);
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

/**
 * useDoctorAvailability Hook
 * Follows: Single Responsibility Principle (SRP)
 */
export function useDoctorAvailability(doctorId?: string, date?: string) {
  const { isLoaded, isSignedIn } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
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
        const container = getServiceContainer();
        const data = await container.doctor.getTimeSlots(
          doctorId,
          date || new Date().toISOString().split("T")[0],
        );
        setSlots(data || []);
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
