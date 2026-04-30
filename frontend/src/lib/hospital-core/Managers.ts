import { BaseHospitalComponent } from './BaseHospitalComponent';

import { getServiceContainer } from '@/lib/services/service-container';
import { RequestConfig } from '@/lib/services/http-client';

type DoctorSummary = {
  id: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  specialty?: string;
  [key: string]: unknown;
};

type TimeSlotSummary = {
  time?: string;
  [key: string]: unknown;
};

type ApiAppointment = {
  appointment_id: string;
  patient_id?: string;
  doctor_id?: string;
  doctor_name?: string;
  patient_name?: string;
  doctor_specialty?: string | null;
  status?: string;
  appointment_type?: string;
  date?: string | null;
  time?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

type MedicalRecordSummary = {
  id?: string;
  record_id?: string;
  record_type?: string;
  title?: string;
  description?: string | null;
  date?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
  vitals?: Record<string, unknown>;
  [key: string]: unknown;
};

type PatientStats = {
  upcoming_appointments?: number;
  medical_records?: number;
  active_prescriptions?: number;
  total_appointments?: number;
  unread_messages?: number;
  [key: string]: unknown;
};

type DoctorStats = {
  total_patients?: number;
  appointments_today?: number;
  pending_reviews?: number;
  unread_messages?: number;
  [key: string]: unknown;
};

type PaymentResponse = {
  success: boolean;
};

function makeRequestConfig(
  token?: string,
  params?: Record<string, unknown>,
): RequestConfig {
  const config: RequestConfig = {};
  if (params) config.params = params;
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  return config;
}

export class BookingManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getAvailableDoctors(specialty?: string, token?: string) {
    const config = makeRequestConfig(token, { specialty });
    const response = await getServiceContainer().httpClient.get<DoctorSummary[]>(`/doctors`, config);
    return response.data;
  }

  async getSlots(doctorId: string, date: string, token?: string) {
    const config = makeRequestConfig(token, { date });
    const response = await getServiceContainer().httpClient.get<TimeSlotSummary[]>(`/doctors/${doctorId}/slots`, config);
    return response.data;
  }

  async submitBooking(formData: Record<string, unknown>, token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.post<ApiAppointment>(`/appointments/bookings`, formData, config);
    return { success: true, appointment: response.data };
  }

  async getMyAppointments(token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.get<ApiAppointment[]>('/appointments/my', config);
    return response.data;
  }

  async getDoctorAppointments(token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.get<ApiAppointment[]>('/appointments/doctor', config);
    return response.data;
  }

  async cancelAppointment(appointmentId: string, token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.patch(`/appointments/${appointmentId}/cancel`, {}, config);
    return response.data;
  }

  async rescheduleAppointment(appointmentId: string, date: string, time: string, token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.patch(`/appointments/${appointmentId}/reschedule`, { date, time }, config);
    return response.data;
  }

  async completeAppointment(appointmentId: string, token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.patch(`/appointments/${appointmentId}/complete`, {}, config);
    return response.data;
  }
}


export class AdminManager extends BaseHospitalComponent {
  constructor() {
    super('admin');
  }

  async getStats(token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.get('/admin/stats', config);
    return response.data;
  }

  async updateStatus(entity: string, id: string, status: string, token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.patch(`/${entity}/${id}/status`, { status }, config);
    return response.data;
  }

  async getAllUsers(token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.get('/users', config);
    return response.data;
  }

  async deleteUser(id: string, token?: string) {
    const config = makeRequestConfig(token);
    await getServiceContainer().httpClient.delete(`/users/${id}`, config);
    return true;
  }

  async addDoctor(doctorData: Record<string, unknown>, token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.post('/doctors', doctorData, config);
    return response.data;
  }
}

export class PaymentProvider extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async processPayment(amount: number, appointmentId: string, token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.post<PaymentResponse>('/payments', { amount, appointmentId }, config);
    return response.data.success;
  }
}

export class MedicalRecordManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getMyRecords(token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.get<MedicalRecordSummary[]>('/medical-records/my', config);
    return response.data;
  }

  async createRecord(payload: Record<string, unknown>, token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.post('/medical-records', payload, config);
    return response.data;
  }
  
  async deleteRecord(recordId: string, token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.delete(`/medical-records/${recordId}`, config);
    return response.data;
  }
}

export class StatsManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getPatientStats(token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.get<PatientStats>('/users/stats', config);
    return response.data;
  }

  async getDoctorStats(token?: string) {
    const config = makeRequestConfig(token);
    const response = await getServiceContainer().httpClient.get<DoctorStats>('/doctors/stats', config);
    return response.data;
  }
}

// Global registry of managers for easy access by components
export const managers = {
  booking: new BookingManager(),
  admin: new AdminManager(),
  payment: new PaymentProvider(),
  medicalRecords: new MedicalRecordManager(),
  stats: new StatsManager(),
};
