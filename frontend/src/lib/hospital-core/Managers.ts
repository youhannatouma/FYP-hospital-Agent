import { BaseHospitalComponent } from './BaseHospitalComponent';
import { db } from './MockDatabase';
import apiClient from '@/lib/api-client';

export class BookingManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getAvailableDoctors(specialty?: string, token?: string) {
    try {
      const config: any = { params: { specialty } };
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.get(`/doctors`, config);
      return response.data;
    } catch (error) {
      console.warn('[BookingManager] API failed, falling back to mock DB');
      const users = db.getUsers();
      return users.filter(u => u.role === 'Doctor' && (!specialty || u.status === 'Active'));
    }
  }

  async getSlots(doctorId: string, date: string, token?: string) {
    try {
      const config: any = { params: { date } };
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.get(`/doctors/${doctorId}/slots`, config);
      return response.data;
    } catch (error) {
      return [{ time: "09:00 AM" }, { time: "10:30 AM" }, { time: "02:00 PM" }];
    }
  }

  async submitBooking(formData: any, token?: string) {
    try {
      const config: any = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const response = await apiClient.post(`/appointments/bookings`, formData, config);
      return { success: true, appointment: response.data };
    } catch (error) {
      const result = db.addAppointment({
        patientId: formData.patientId || "1",
        patientName: formData.patientName || "Sarah Johnson",
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        date: formData.date,
        time: formData.time,
        status: 'Pending',
        price: 150
      });
      return { success: !!result, appointment: result };
    }
  }

  async getMyAppointments(token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.get('/appointments/my', config);
      return response.data;
    } catch (error) {
      return db.getAppointmentsByPatient?.() || db.getAppointments();
    }
  }

  async getDoctorAppointments(token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.get('/appointments/doctor', config);
      return response.data;
    } catch (error) {
      return db.getAppointmentsByDoctor?.() || db.getAppointments();
    }
  }

  async cancelAppointment(appointmentId: string, token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.patch(`/appointments/${appointmentId}/cancel`, {}, config);
      return response.data;
    } catch (error) {
      return { error: 'failed' };
    }
  }

  async rescheduleAppointment(appointmentId: string, date: string, time: string, token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.patch(`/appointments/${appointmentId}/reschedule`, { date, time }, config);
      return response.data;
    } catch (error) {
      return { error: 'failed' };
    }
  }
}

export class AdminManager extends BaseHospitalComponent {
  constructor() {
    super('admin');
  }

  async getStats(token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.get('/admin/stats', config);
      return response.data;
    } catch (error) {
      return db.getStats();
    }
  }

  async updateStatus(entity: string, id: string, status: string, token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.patch(`/${entity}/${id}/status`, { status }, config);
      return response.data;
    } catch (error) {
      if (entity === 'users' || entity === 'user') {
        return db.updateUserStatus(id, status as any);
      }
      return { error: "Entity not supported yet" };
    }
  }

  async getAllUsers(token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.get('/users', config);
      return response.data;
    } catch (error) {
      return db.getUsers();
    }
  }

  async deleteUser(id: string, token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      await apiClient.delete(`/users/${id}`, config);
      return true;
    } catch (error) {
      return db.deleteUser(id);
    }
  }

  async addDoctor(doctorData: any, token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.post('/doctors', doctorData, config);
      return response.data;
    } catch (error) {
      return db.addUser({
        id: Math.random().toString(36).substr(2, 9),
        name: doctorData.name,
        email: doctorData.email,
        role: 'Doctor',
        status: 'Active',
        verified: true,
        password: doctorData.password,
        customId: doctorData.customId
      });
    }
  }
}

export class PaymentProvider extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async processPayment(amount: number, appointmentId: string, token?: string) {
    try {
      const config: any = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      const response = await apiClient.post('/payments', { amount, appointmentId }, config);
      return response.data.success;
    } catch (error) {
      console.log(`[Payment] Processing $${amount} for appointment ${appointmentId}`);
      const result = await this.handleAction('pay', { amount, appointmentId });
      return result && !result.error;
    }
  }
}

// Global registry of managers for easy access by components
export const managers = {
  booking: new BookingManager(),
  admin: new AdminManager(),
  payment: new PaymentProvider(),
};
