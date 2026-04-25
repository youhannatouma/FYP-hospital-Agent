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
  patient_id: string;
  doctor_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  instructions: string | null;
  status: 'active' | 'completed' | 'cancelled';
  prescribed_at: string;
  expires_at: string | null;
}

export interface CreatePrescriptionDto {
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
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
    return this.apiHelper.post<Prescription>('/prescriptions/', data);
  }

  async cancelPrescription(id: string): Promise<void> {
    await this.apiHelper.patch(`/prescriptions/${id}/cancel`, {});
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
