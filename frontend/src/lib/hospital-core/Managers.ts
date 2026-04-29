import { BaseHospitalComponent } from './BaseHospitalComponent';
import apiClient from '@/lib/api-client';

export class BookingManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getAvailableDoctors(specialty?: string, token?: string) {
    const config: any = { params: { specialty } };
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get(`/doctors`, config);
    return response.data;
  }

  async getSlots(doctorId: string, date: string, token?: string) {
    const config: any = { params: { date } };
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get(`/doctors/${doctorId}/slots`, config);
    return response.data;
  }

  async submitBooking(formData: any, token?: string) {
    const config: any = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const response = await apiClient.post(`/appointments/bookings`, formData, config);
    return { success: true, appointment: response.data };
  }

  async getMyAppointments(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/appointments/my', config);
    return response.data;
  }

  async getDoctorAppointments(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/appointments/doctor', config);
    return response.data;
  }

  async cancelAppointment(appointmentId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/appointments/${appointmentId}/cancel`, {}, config);
    return response.data;
  }

  async rescheduleAppointment(appointmentId: string, date: string, time: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/appointments/${appointmentId}/reschedule`, { date, time }, config);
    return response.data;
  }

  async completeAppointment(appointmentId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/appointments/${appointmentId}/complete`, {}, config);
    return response.data;
  }

  async acceptAppointment(appointmentId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/appointments/${appointmentId}/accept`, {}, config);
    return response.data;
  }

  async rejectAppointment(appointmentId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/appointments/${appointmentId}/reject`, {}, config);
    return response.data;
  }

  async startAppointment(appointmentId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/appointments/${appointmentId}/start`, {}, config);
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
    const response = await apiClient.get('/admin/stats', config);
    return response.data;
  }

  async updateStatus(entity: string, id: string, status: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/${entity}/${id}/status`, { status }, config);
    return response.data;
  }

  async getAllUsers(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/users', config);
    return response.data;
  }

  async deleteUser(id: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    await apiClient.delete(`/users/${id}`, config);
    return true;
  }

  async addDoctor(doctorData: any, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.post('/doctors', doctorData, config);
    return response.data;
  }

  async syncClerkRegistry(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.post('/admin/sync-clerk', {}, config);
    return response.data;
  }

  async updateMe(data: any, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch('/users/me', data, config);
    return response.data;
  }

  async getMe(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/users/me', config);
    return response.data;
  }
}

export class PaymentProvider extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async processPayment(amount: number, appointmentId?: string, invoiceId?: string, token?: string, auth_token?: string) {
    const config: any = {};
    if (auth_token) config.headers = { Authorization: `Bearer ${auth_token}` };
    const response = await apiClient.post('/payments', { 
      amount, 
      appointmentId, 
      invoiceId,
      token // Payment gateway token
    }, config);
    return response.data;
  }

  async getMyInvoices(auth_token?: string) {
    const config: any = {};
    if (auth_token) config.headers = { Authorization: `Bearer ${auth_token}` };
    const response = await apiClient.get('/payments/invoices', config);
    return response.data;
  }
}

export class MedicalRecordManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getMyRecords(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/medical-records/my', config);
    return response.data;
  }

  async getPatientRecords(patientId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get(`/medical-records/patient/${patientId}`, config);
    return response.data;
  }

  async createRecord(payload: any, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.post('/medical-records', payload, config);
    return response.data;
  }
  
  async getPendingLabOrders(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/medical-records/pending-labs', config);
    return response.data;
  }

  async submitLabResults(recordId: string, results: any, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/medical-records/${recordId}/results`, { results }, config);
    return response.data;
  }

  async updateRecord(recordId: string, payload: any, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/medical-records/${recordId}`, payload, config);
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
    const response = await apiClient.get('/users/stats', config);
    return response.data;
  }

  async getDoctorStats(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/doctors/stats', config);
    return response.data;
  }
}

export class PharmacyManager extends BaseHospitalComponent {
  constructor() {
    super('doctor');
  }

  async getPendingPrescriptions(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/prescriptions/pending', config);
    return response.data;
  }

  async getMyPrescriptions(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/prescriptions/my', config);
    return response.data;
  }

  async fulfillPrescription(prescriptionId: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.patch(`/prescriptions/${prescriptionId}/fulfill`, {}, config);
    return response.data;
  }

  async createPrescription(payload: any, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.post('/prescriptions/', payload, config);
    return response.data;
  }
}

export class DoctorManager extends BaseHospitalComponent {
  async getRecentPatients(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/doctors/recent-patients', config);
    return response.data;
  }
}

export class MessageManager extends BaseHospitalComponent {
  async getMyMessages(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/messages/my', config);
    return response.data;
  }

  async sendMessage(receiverId: string, content: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.post('/messages', { receiver_id: receiverId, content }, config);
    return response.data;
  }
}

export class NotificationManager extends BaseHospitalComponent {
  async getNotifications(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.get('/notifications/', config);
    return response.data;
  }

  async markRead(id: string, token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    await apiClient.patch(`/notifications/${id}/read`, {}, config);
    return true;
  }

  async markAllRead(token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    await apiClient.patch('/notifications/read-all', {}, config);
    return true;
  }
}

export class AIManager extends BaseHospitalComponent {
  async chat(message: string, context: string = 'doctor', token?: string) {
    const config: any = {};
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    const response = await apiClient.post('/ai/chat', { message, context }, config);
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
  pharmacy: new PharmacyManager(),
  doctor: new DoctorManager(),
  messages: new MessageManager(),
  notifications: new NotificationManager(),
  ai: new AIManager(),
};
