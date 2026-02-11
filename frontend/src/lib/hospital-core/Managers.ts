import { BaseHospitalComponent } from './BaseHospitalComponent';
import { db } from './MockDatabase';
import apiClient from '@/lib/api-client';

export class BookingManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getAvailableDoctors(specialty?: string) {
    try {
      const response = await apiClient.get(`/doctors`, { params: { specialty } });
      return response.data;
    } catch (error) {
      console.warn('[BookingManager] API failed, falling back to mock DB');
      const users = db.getUsers();
      return users.filter(u => u.role === 'Doctor' && (!specialty || u.status === 'Active'));
    }
  }

  async getSlots(doctorId: string, date: string) {
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/slots`, { params: { date } });
      return response.data;
    } catch (error) {
      return [{ time: "09:00 AM" }, { time: "10:30 AM" }, { time: "02:00 PM" }];
    }
  }

  async submitBooking(formData: any) {
    try {
      const response = await apiClient.post(`/bookings`, formData);
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
}

export class AdminManager extends BaseHospitalComponent {
  constructor() {
    super('admin');
  }

  async getStats() {
    try {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    } catch (error) {
      return db.getStats();
    }
  }

  async updateStatus(entity: string, id: string, status: string) {
    try {
      const response = await apiClient.patch(`/${entity}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      if (entity === 'users' || entity === 'user') {
        return db.updateUserStatus(id, status as any);
      }
      return { error: "Entity not supported yet" };
    }
  }

  async getAllUsers() {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      return db.getUsers();
    }
  }

  async deleteUser(id: string) {
    try {
      await apiClient.delete(`/users/${id}`);
      return true;
    } catch (error) {
      return db.deleteUser(id);
    }
  }

  async addDoctor(doctorData: any) {
    try {
      const response = await apiClient.post('/doctors', doctorData);
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

  async processPayment(amount: number, appointmentId: string) {
    try {
      const response = await apiClient.post('/payments', { amount, appointmentId });
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
