import { BaseHospitalComponent } from './BaseHospitalComponent';

import { getServiceContainer } from '@/lib/services/service-container';

export class BookingManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getAvailableDoctors(specialty?: string, token?: string) {
    const config: any = { params: { specialty } };
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.get(`/doctors`, config);
    return response.data;
  }

  async getSlots(doctorId: string, date: string, token?: string) {
    const config: any = { params: { date } };
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.get(`/doctors/${doctorId}/slots`, config);
    return response.data;
  }

  async submitBooking(formData: any, token?: string) {
    const config: any = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const response = await getServiceContainer().httpClient.post(`/appointments/bookings`, formData, config);
    return { success: true, appointment: response.data };
  }

  async getMyAppointments(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.get('/appointments/my', config);
    return response.data;
  }

  async getDoctorAppointments(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.get('/appointments/doctor', config);
    return response.data;
  }

  async cancelAppointment(appointmentId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.patch(`/appointments/${appointmentId}/cancel`, {}, config);
    return response.data;
  }

  async rescheduleAppointment(appointmentId: string, date: string, time: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.patch(`/appointments/${appointmentId}/reschedule`, { date, time }, config);
    return response.data;
  }

  async completeAppointment(appointmentId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.patch(`/appointments/${appointmentId}/complete`, {}, config);
    return response.data;
  }
}


export class AdminManager extends BaseHospitalComponent {
  constructor() {
    super('admin');
  }

  async getStats(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.get('/admin/stats', config);
    return response.data;
  }

  async updateStatus(entity: string, id: string, status: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.patch(`/${entity}/${id}/status`, { status }, config);
    return response.data;
  }

  async getAllUsers(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.get('/users', config);
    return response.data;
  }

  async deleteUser(id: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    await getServiceContainer().httpClient.delete(`/users/${id}`, config);
    return true;
  }

  async addDoctor(doctorData: any, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.post('/doctors', doctorData, config);
    return response.data;
  }
}

export class PaymentProvider extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async processPayment(amount: number, appointmentId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.post('/payments', { amount, appointmentId }, config);
    return response.data.success;
  }
}

export class MedicalRecordManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getMyRecords(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.get('/medical-records/my', config);
    return response.data;
  }

  async createRecord(payload: any, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.post('/medical-records', payload, config);
    return response.data;
  }
  
  async deleteRecord(recordId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.delete(`/medical-records/${recordId}`, config);
    return response.data;
  }
}

export class StatsManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getPatientStats(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.get('/users/stats', config);
    return response.data;
  }

  async getDoctorStats(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await getServiceContainer().httpClient.get('/doctors/stats', config);
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

