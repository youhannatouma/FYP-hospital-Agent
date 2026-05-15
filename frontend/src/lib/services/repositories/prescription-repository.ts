/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Prescription Repository
 * Handles all prescription-related API calls
 * Follows: Single Responsibility Principle (SRP)
 * Follows: Open/Closed Principle (OCP)
 * Follows: Dependency Inversion Principle (DIP)
 */

import { ApiRequestHelper } from '../api-request-helper';

export interface Prescription {
  id: string;
  prescription_id?: string;
  patient_id: string;
  doctor_id: string;
  doctor_name?: string;
  medication_name?: string;
  medications?: string[];
  dosage?: string;
  frequency?: string;
  duration?: string | null;
  instructions: string | null;
  status: string;
  prescribed_at?: string;
  created_at?: string;
  issue_date?: string;
  expiry_date?: string | null;
  expires_at?: string | null;
  is_filled?: boolean;
  medicine_name?: string;
}

export interface CreatePrescriptionDto {
  patient_id: string;
  medications?: string[];
  medication_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  expires_at?: string;
}

export interface IPrescriptionRepository {
  getMyPrescriptions(): Promise<Prescription[]>;
  getPrescriptionsByPatient(patientId: string): Promise<Prescription[]>;
  getPrescriptionById(id: string): Promise<Prescription>;
  createPrescription(data: CreatePrescriptionDto): Promise<Prescription>;
  cancelPrescription(id: string): Promise<void>;
  getAllPrescriptions(): Promise<Prescription[]>;
  fulfillPrescription(id: string): Promise<void>;
}

export class PrescriptionRepository implements IPrescriptionRepository {
  constructor(private apiHelper: ApiRequestHelper) {}

  async getMyPrescriptions(): Promise<Prescription[]> {
    return this.apiHelper.get<Prescription[]>('/prescriptions/my');
  }

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    return this.apiHelper.get<Prescription[]>(`/prescriptions/patient/${patientId}`);
  }

  async getPrescriptionById(id: string): Promise<Prescription> {
    return this.apiHelper.get<Prescription>(`/prescriptions/${id}`);
  }

  async createPrescription(data: CreatePrescriptionDto): Promise<Prescription> {
    const medications = Array.isArray(data.medications) && data.medications.length > 0
      ? data.medications
      : [data.medication_name || "Medication"].filter(Boolean);
    const instructions = data.instructions
      || [data.dosage, data.frequency, data.duration].filter(Boolean).join(" | ")
      || "Take as directed";

    return this.apiHelper.post<Prescription>('/prescriptions/', {
      patient_id: data.patient_id,
      medications,
      instructions,
    });
  }

  async cancelPrescription(id: string): Promise<void> {
    await this.apiHelper.patch(`/prescriptions/${id}/cancel`, {});
  }

  async getAllPrescriptions(): Promise<Prescription[]> {
    return this.apiHelper.get<Prescription[]>('/prescriptions/all');
  }

  async fulfillPrescription(id: string): Promise<void> {
    await this.apiHelper.patch(`/prescriptions/${id}/fulfill`, {});
  }
}

let prescriptionRepositoryInstance: IPrescriptionRepository | null = null;

export function getPrescriptionRepository(apiHelper?: ApiRequestHelper): IPrescriptionRepository {
  if (!prescriptionRepositoryInstance) {
    const { getApiRequestHelper } = require('../api-request-helper');
    prescriptionRepositoryInstance = new PrescriptionRepository(
      apiHelper || getApiRequestHelper()
    );
  }
  return prescriptionRepositoryInstance;
}

export function setPrescriptionRepository(repo: IPrescriptionRepository): void {
  prescriptionRepositoryInstance = repo;
}
