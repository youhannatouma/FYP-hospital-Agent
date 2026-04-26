/**
 * Stats Repository
 * Handles all statistics API calls for both admin and role-specific views
 * Follows: Single Responsibility Principle (SRP)
 * Follows: Open/Closed Principle (OCP)
 * Follows: Dependency Inversion Principle (DIP)
 */

import { ApiRequestHelper } from '../api-request-helper';

export interface StatsData {
  total_users: number;
  total_doctors: number;
  total_patients: number;
  total_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  [key: string]: any;
}

export interface DoctorStatsData {
  total_patients: number;
  appointments_today: number;
  pending_reviews: number;
  unread_messages: number;
  last_updated?: string;
  [key: string]: any;
}

export interface PatientStatsData {
  upcoming_appointments: number;
  total_appointments: number;
  active_prescriptions: number;
  unread_messages: number;
  [key: string]: any;
}

export interface IStatsRepository {
  /** Admin-level aggregate stats */
  getStats(): Promise<StatsData>;
  /** Doctor-specific dashboard stats */
  getDoctorStats(): Promise<DoctorStatsData>;
  /** Patient-specific dashboard stats */
  getPatientStats(): Promise<PatientStatsData>;
  updateStatus(entity: string, id: string, status: string): Promise<any>;
  /** Sync Clerk users to local registry (admin action) */
  syncRegistry(): Promise<{ message: string }>;
}

export class StatsRepository implements IStatsRepository {
  constructor(private apiHelper: ApiRequestHelper) {}

  async getStats(): Promise<StatsData> {
    return this.apiHelper.get<StatsData>('/admin/stats');
  }

  async getDoctorStats(): Promise<DoctorStatsData> {
    return this.apiHelper.get<DoctorStatsData>('/doctors/stats');
  }

  async getPatientStats(): Promise<PatientStatsData> {
    return this.apiHelper.get<PatientStatsData>('/users/stats');
  }

  async updateStatus(entity: string, id: string, status: string): Promise<any> {
    return this.apiHelper.patch(`/${entity}/${id}/status`, { status });
  }

  async syncRegistry(): Promise<{ message: string }> {
    return this.apiHelper.post<{ message: string }>('/admin/sync-clerk', {});
  }
}

let statsRepositoryInstance: IStatsRepository | null = null;

export function getStatsRepository(apiHelper?: ApiRequestHelper): IStatsRepository {
  if (!statsRepositoryInstance) {
    const { getApiRequestHelper } = require('../api-request-helper');
    statsRepositoryInstance = new StatsRepository(apiHelper || getApiRequestHelper());
  }
  return statsRepositoryInstance;
}

export function setStatsRepository(repo: IStatsRepository): void {
  statsRepositoryInstance = repo;
}
