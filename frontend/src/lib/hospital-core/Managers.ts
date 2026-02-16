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
    } catch {
      const doctors = db.getDoctors();
      if (specialty) {
        return doctors.filter(d => d.specialty === specialty);
      }
      return doctors;
    }
  }

  async getSlots(doctorId: string, date: string) {
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/slots`, { params: { date } });
      return response.data;
    } catch {
      return [
        { time: "09:00 AM" }, { time: "09:30 AM" }, { time: "10:00 AM" },
        { time: "10:30 AM" }, { time: "11:00 AM" }, { time: "11:30 AM" },
        { time: "01:00 PM" }, { time: "01:30 PM" }, { time: "02:00 PM" },
        { time: "02:30 PM" }, { time: "03:00 PM" }, { time: "03:30 PM" },
      ];
    }
  }

  async submitBooking(formData: any) {
    try {
      const response = await apiClient.post(`/bookings`, formData);
      return { success: true, appointment: response.data };
    } catch {
      const doctor = db.getUserById(formData.doctorId);
      const result = db.addAppointment({
        patientId: formData.patientId || "pat-1",
        patientName: formData.patientName || "Sarah Johnson",
        doctorId: formData.doctorId,
        doctorName: doctor?.name || formData.doctorName || "Doctor",
        specialty: doctor?.specialty || formData.specialty,
        date: formData.date,
        time: formData.time,
        status: 'Scheduled',
        type: formData.type || 'Consultation',
        price: formData.price || 150,
        isVirtual: formData.isVirtual || false,
      });
      return { success: !!result, appointment: result };
    }
  }

  async cancelAppointment(appointmentId: string) {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/cancel`);
      return response.data;
    } catch {
      return db.updateAppointmentStatus(appointmentId, 'Cancelled');
    }
  }

  async rescheduleAppointment(appointmentId: string, newDate: string, newTime: string) {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/reschedule`, { date: newDate, time: newTime });
      return response.data;
    } catch {
      return db.rescheduleAppointment(appointmentId, newDate, newTime);
    }
  }

  async completeAppointment(appointmentId: string) {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/complete`);
      return response.data;
    } catch {
      return db.updateAppointmentStatus(appointmentId, 'Completed');
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
    } catch {
      return db.getStats();
    }
  }

  async updateStatus(entity: string, id: string, status: string) {
    try {
      const response = await apiClient.patch(`/${entity}/${id}/status`, { status });
      return response.data;
    } catch {
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
    } catch {
      return db.getUsers();
    }
  }

  async deleteUser(id: string) {
    try {
      await apiClient.delete(`/users/${id}`);
      return true;
    } catch {
      return db.deleteUser(id);
    }
  }

  async addDoctor(doctorData: any) {
    try {
      const response = await apiClient.post('/doctors', doctorData);
      return response.data;
    } catch {
      return db.addUser({
        id: `doc-${Math.random().toString(36).substr(2, 9)}`,
        name: doctorData.name,
        email: doctorData.email,
        role: 'Doctor',
        status: 'Active',
        verified: true,
        password: doctorData.password,
        customId: doctorData.customId,
        specialty: doctorData.specialty,
        phone: doctorData.phone,
        licenseNumber: doctorData.licenseNumber,
        yearsOfExperience: doctorData.yearsOfExperience,
        bio: doctorData.bio,
      });
    }
  }

  async verifyDoctor(id: string) {
    try {
      const response = await apiClient.patch(`/doctors/${id}/verify`);
      return response.data;
    } catch {
      return db.verifyDoctor(id);
    }
  }

  async getAuditLogs() {
    try {
      const response = await apiClient.get('/admin/audit-logs');
      return response.data;
    } catch {
      return db.getAuditLogs();
    }
  }
}

export class PaymentProvider extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async processPayment(amount: number, invoiceId: string) {
    try {
      const response = await apiClient.post('/payments', { amount, invoiceId });
      return response.data.success;
    } catch {
      const result = db.payInvoice(invoiceId);
      return !!result;
    }
  }
}

// Global registry of managers for easy access by components
export const managers = {
  booking: new BookingManager(),
  admin: new AdminManager(),
  payment: new PaymentProvider(),
};
