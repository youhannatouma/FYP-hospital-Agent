// @ts-nocheck
"use client";

/**
 * useMedicalRecords Hook
 * Follows: Single Responsibility Principle (SRP) — manages only medical record state
 * Follows: Dependency Inversion Principle (DIP) — uses IMedicalRecordRepository via container
 * Follows: Interface Segregation Principle (ISP) — exposes only what consumers need
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getServiceContainer } from "@/lib/services/service-container";
import { MedicalRecord, CreateMedicalRecordDto } from "@/lib/services/repositories/medical-record-repository";

interface UseMedicalRecordsReturn {
  records: MedicalRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createRecord: (data: CreateMedicalRecordDto) => Promise<MedicalRecord | null>;
}

export function useMedicalRecords(): UseMedicalRecordsReturn {
  const { isLoaded, isSignedIn } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.medicalRecord.getMyRecords();
      setRecords(data || []);
      setError(null);
    } catch (err: unknown) {
      setError(err?.message || "Failed to fetch medical records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  /**
   * Create a new medical record and append to local state
   * Returns the new record or null on failure
   */
  const createRecord = useCallback(
    async (data: CreateMedicalRecordDto): Promise<MedicalRecord | null> => {
      try {
        const container = getServiceContainer();
        const newRecord = await container.medicalRecord.createRecord(data);
        setRecords((prev) => [newRecord, ...prev]);
        return newRecord;
      } catch (err: unknown) {
        console.error("[useMedicalRecords] Failed to create record:", err);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
    createRecord,
  };
}

/**
 * usePatientRecords — for doctor views, loads records for a specific patient
 * Follows: Interface Segregation Principle (ISP)
 */
export function usePatientRecords(patientId: string | null) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const container = getServiceContainer();
      const data = await container.medicalRecord.getRecordsByPatient(patientId);
      setRecords(data || []);
      setError(null);
    } catch (err: unknown) {
      setError(err?.message || "Failed to fetch patient records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { records, loading, error, refetch: fetchRecords };
}
