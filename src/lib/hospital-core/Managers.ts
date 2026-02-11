import { BaseHospitalComponent } from './BaseHospitalComponent';
import { db } from './MockDatabase';

export class BookingManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getAvailableDoctors(specialty?: string) {
    // In a real app, this would be a fetch. 
    // For now, we get doctors from the user registry.
    const users = db.getUsers();
    return users.filter(u => u.role === 'Doctor' && (!specialty || u.status === 'Active'));
  }

  async getSlots(doctorId: string, date: string) {
    return [{ time: "09:00 AM" }, { time: "10:30 AM" }, { time: "02:00 PM" }];
  }

  async submitBooking(formData: any) {
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

export class AdminManager extends BaseHospitalComponent {
  constructor() {
    super('admin');
  }

  async getStats() {
    return db.getStats();
  }

  async updateStatus(entity: string, id: string, status: string) {
    if (entity === 'users' || entity === 'user') {
      return db.updateUserStatus(id, status as any);
    }
    return { error: "Entity not supported yet" };
  }

  async getAllUsers() {
    return db.getUsers();
  }

  async deleteUser(id: string) {
    return db.deleteUser(id);
  }
}

export class PaymentProvider extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async processPayment(amount: number, appointmentId: string) {
    console.log(`[Payment] Processing $${amount} for appointment ${appointmentId}`);
    // Simulate payment sequence
    const result = await this.handleAction('pay', { amount, appointmentId });
    // In a real app, integrate with Stripe.confirmCardPayment
    return result && !result.error;
  }
}

// Global registry of managers for easy access by components
export const managers = {
  booking: new BookingManager(),
  admin: new AdminManager(),
  payment: new PaymentProvider(),
};
