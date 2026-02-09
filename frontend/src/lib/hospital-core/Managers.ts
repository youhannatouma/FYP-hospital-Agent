import { BaseHospitalComponent } from './BaseHospitalComponent';

export class BookingManager extends BaseHospitalComponent {
  constructor() {
    super('patient');
  }

  async getAvailableDoctors(specialty?: string) {
    const endpoint = specialty ? `/doctors?specialty=${specialty}` : '/doctors';
    return await this.fetchData(endpoint);
  }

  async getSlots(doctorId: string, date: string) {
    return await this.fetchData(`/doctors/${doctorId}/slots?date=${date}`);
  }

  async submitBooking(formData: any) {
    return await this.handleAction('book', formData);
  }
}

export class AdminManager extends BaseHospitalComponent {
  constructor() {
    super('admin');
  }

  async getStats() {
    return await this.fetchData('/admin/stats');
  }

  async updateStatus(entity: string, id: string, status: string) {
    return await this.handleAction('update_status', { entity, id, status });
  }

  async getAllUsers() {
    return await this.fetchData('/admin/users');
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
