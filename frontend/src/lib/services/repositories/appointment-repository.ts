// @ts-nocheck
/**
 * Appointment Repository
 * Handles all appointment-related API calls
 * Follows: Single Responsibility Principle (SRP)
 * Follows: Repository Pattern
 */

import { ApiRequestHelper } from '../api-request-helper';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  reason: string | null;
  notes: string | null;
  created_at: string;
}

export interface IAppointmentRepository {
  getMyAppointments(): Promise<Appointment[]>;
  getDoctorAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment>;
  bookAppointment(data: unknown): Promise<Appointment>;
  doctorBookAppointment(data: unknown): Promise<unknown>;
  cancelAppointment(id: string): Promise<void>;
  rescheduleAppointment(id: string, date: string, time: string): Promise<Appointment>;
  completeAppointment(id: string): Promise<Appointment>;
}

export class AppointmentRepository implements IAppointmentRepository {
  constructor(private apiHelper: ApiRequestHelper) {}

  async getMyAppointments(): Promise<Appointment[]> {
    return this.apiHelper.get<Appointment[]>('/appointments/my');
  }

  async getDoctorAppointments(): Promise<Appointment[]> {
    return this.apiHelper.get<Appointment[]>('/appointments/doctor');
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    return this.apiHelper.get<Appointment>(`/appointments/${id}`);
  }

  async bookAppointment(data: unknown): Promise<Appointment> {
    return this.apiHelper.post<Appointment>('/appointments/bookings', data);
  }

  async doctorBookAppointment(data: unknown): Promise<unknown> {
    return this.apiHelper.post('/appointments/doctor/bookings', data);
  }

  async cancelAppointment(id: string): Promise<void> {
    await this.apiHelper.patch(`/appointments/${id}/cancel`, {});
  }

  async rescheduleAppointment(id: string, date: string, time: string): Promise<Appointment> {
    return this.apiHelper.patch<Appointment>(`/appointments/${id}/reschedule`, { date, time });
  }

  async completeAppointment(id: string): Promise<Appointment> {
    return this.apiHelper.patch<Appointment>(`/appointments/${id}/complete`, {});
  }
}

let appointmentRepositoryInstance: IAppointmentRepository | null = null;

export function getAppointmentRepository(apiHelper?: ApiRequestHelper): IAppointmentRepository {
  if (!appointmentRepositoryInstance) {
    appointmentRepositoryInstance = new AppointmentRepository(apiHelper || getApiRequestHelper());
  }
  return appointmentRepositoryInstance;
}

export function setAppointmentRepository(repo: IAppointmentRepository): void {
  appointmentRepositoryInstance = repo;
}
