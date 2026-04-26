"use client";

/**
 * usePrescriptions Hook
 * Follows: Single Responsibility Principle (SRP) — manages only prescription state
 * Follows: Dependency Inversion Principle (DIP) — uses IPrescriptionRepository via container
 * Follows: Interface Segregation Principle (ISP) — exposes only what consumers need
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getServiceContainer } from "@/lib/services/service-container";
import {
  Prescription,
  CreatePrescriptionDto,
} from "@/lib/services/repositories/prescription-repository";

interface UsePrescriptionsReturn {
  prescriptions: Prescription[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPrescription: (data: CreatePrescriptionDto) => Promise<Prescription | null>;
  cancelPrescription: (id: string) => Promise<boolean>;
}

export function usePrescriptions(): UsePrescriptionsReturn {
  const { isLoaded, isSignedIn } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.prescription.getMyPrescriptions();
      setPrescriptions(data || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch prescriptions");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  /**
   * Create a new prescription and append to local state
   */
  const createPrescription = useCallback(
    async (data: CreatePrescriptionDto): Promise<Prescription | null> => {
      try {
        const container = getServiceContainer();
        const newPrescription = await container.prescription.createPrescription(data);
        setPrescriptions((prev) => [newPrescription, ...prev]);
        return newPrescription;
      } catch (err: any) {
        console.error("[usePrescriptions] Failed to create prescription:", err);
        return null;
      }
    },
    []
  );

  /**
   * Cancel a prescription by ID — optimistic state update
   */
  const cancelPrescription = useCallback(async (id: string): Promise<boolean> => {
    try {
      const container = getServiceContainer();
      await container.prescription.cancelPrescription(id);
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "cancelled" as const } : p))
      );
      return true;
    } catch (err: any) {
      console.error("[usePrescriptions] Failed to cancel prescription:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return {
    prescriptions,
    loading,
    error,
    refetch: fetchPrescriptions,
    createPrescription,
    cancelPrescription,
  };
}

/**
 * usePatientPrescriptions — for doctor views, loads prescriptions for a specific patient
 * Follows: Interface Segregation Principle (ISP)
 */
export function usePatientPrescriptions(patientId: string | null) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.prescription.getPrescriptionsByPatient(patientId);
      setPrescriptions(data || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch patient prescriptions");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return { prescriptions, loading, error, refetch: fetchPrescriptions };
}
