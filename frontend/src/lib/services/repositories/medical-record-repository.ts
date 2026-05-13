/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Medical Record Repository
 * Handles all medical-records related API calls
 * Follows: Single Responsibility Principle (SRP)
 * Follows: Open/Closed Principle (OCP)
 * Follows: Dependency Inversion Principle (DIP)
 */

import { ApiRequestHelper } from '../api-request-helper';

export interface MedicalRecord {
  id: string;
  record_id: string;
  patient_id: string;
  doctor_id: string | null;
  record_type: string;
  title: string;
  description: string | null;
  diagnosis: string | null;
  treatment: string | null;
  clinical_notes: string | null;
  vitals: Record<string, unknown> | null;
  is_reviewed?: boolean;
  date: string;
  file_url: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  patient_name?: string;
}

export interface CreateMedicalRecordDto {
  record_type: string;
  title: string;
  description?: string;
  date: string;
  file_url?: string;
  patient_id?: string;
  appointment_id?: string;
}

export interface IMedicalRecordRepository {
  getMyRecords(): Promise<MedicalRecord[]>;
  getRecordsByPatient(patientId: string): Promise<MedicalRecord[]>;
  getRecordById(id: string): Promise<MedicalRecord>;
  createRecord(data: CreateMedicalRecordDto): Promise<MedicalRecord>;
  deleteRecord(id: string): Promise<void>;
}

export class MedicalRecordRepository implements IMedicalRecordRepository {
  constructor(private apiHelper: ApiRequestHelper) {}

  async getMyRecords(): Promise<MedicalRecord[]> {
    return this.apiHelper.get<MedicalRecord[]>('/medical-records/my');
  }

  async getRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    return this.apiHelper.get<MedicalRecord[]>(`/medical-records/patient/${patientId}`);
  }

  async getRecordById(id: string): Promise<MedicalRecord> {
    return this.apiHelper.get<MedicalRecord>(`/medical-records/${id}`);
  }

  async createRecord(data: CreateMedicalRecordDto): Promise<MedicalRecord> {
    return this.apiHelper.post<MedicalRecord>('/medical-records/', data);
  }

  async deleteRecord(id: string): Promise<void> {
    await this.apiHelper.delete(`/medical-records/${id}`);
  }
}

let medicalRecordRepositoryInstance: IMedicalRecordRepository | null = null;

export function getMedicalRecordRepository(apiHelper?: ApiRequestHelper): IMedicalRecordRepository {
  if (!medicalRecordRepositoryInstance) {
    const { getApiRequestHelper } = require('../api-request-helper');
    medicalRecordRepositoryInstance = new MedicalRecordRepository(
      apiHelper || getApiRequestHelper()
    );
  }
  return medicalRecordRepositoryInstance;
}

export function setMedicalRecordRepository(repo: IMedicalRecordRepository): void {
  medicalRecordRepositoryInstance = repo;
}
