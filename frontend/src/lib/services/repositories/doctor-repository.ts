// @ts-nocheck
/**
 * Doctor Repository
 * Handles all doctor-related API calls
 * Follows: Single Responsibility Principle (SRP)
 * Follows: Repository Pattern
 */

import { ApiRequestHelper } from '../api-request-helper';

export interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  license_number: string;
  years_of_experience: number;
  qualifications: string[];
  clinic_address: string;
  availability_status: string;
}

export interface TimeSlot {
  slot_id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  time: string;
  is_available: boolean;
}

export interface RecentPatient {
  id: string;
  name: string;
  avatar: string | null;
  initials: string;
  condition: string;
  lastVisit: string;
}

export interface IDoctorRepository {
  getAvailableDoctors(specialty?: string): Promise<Doctor[]>;
  getDoctorById(id: string): Promise<Doctor>;
  getTimeSlots(doctorId: string, date: string): Promise<TimeSlot[]>;
  getRecentPatients(): Promise<RecentPatient[]>;
}

export class DoctorRepository implements IDoctorRepository {
  constructor(private apiHelper: ApiRequestHelper) {}

  async getAvailableDoctors(specialty?: string): Promise<Doctor[]> {
    const params = specialty ? { specialty } : undefined;
    return this.apiHelper.get<Doctor[]>('/doctors', { params });
  }

  async getDoctorById(id: string): Promise<Doctor> {
    return this.apiHelper.get<Doctor>(`/doctors/${id}`);
  }

  async getTimeSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    return this.apiHelper.get<TimeSlot[]>(`/doctors/${doctorId}/slots`, { params: { date } });
  }

  async getRecentPatients(): Promise<RecentPatient[]> {
    const users = await this.apiHelper.get<unknown[]>('/doctors/recent-patients');
    // Map backend User model to the UI-friendly RecentPatient shape
    return users.map((u: unknown) => ({
      id: u.user_id,
      name: `${u.first_name} ${u.last_name}`,
      avatar: u.avatar_url || null,
      initials: `${(u.first_name || 'U')[0]}${(u.last_name || 'P')[0]}`,
      condition: u.role === 'patient' ? 'Patient' : u.role,
      lastVisit: u.last_active
        ? new Date(u.last_active).toLocaleDateString()
        : 'Recent',
    }));
  }
}

let doctorRepositoryInstance: IDoctorRepository | null = null;

export function getDoctorRepository(apiHelper?: ApiRequestHelper): IDoctorRepository {
  if (!doctorRepositoryInstance) {
    doctorRepositoryInstance = new DoctorRepository(apiHelper || getApiRequestHelper());
  }
  return doctorRepositoryInstance;
}

export function setDoctorRepository(repo: IDoctorRepository): void {
  doctorRepositoryInstance = repo;
}
