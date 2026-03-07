/**
 * MockDatabase Singleton
 * Handles in-memory storage with localStorage persistence for a realistic app experience.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Patient' | 'Doctor' | 'Pharmacy' | 'Admin';
  status: 'Active' | 'Pending' | 'Suspended';
  joined: string;
  lastActive: string;
  verified?: boolean;
  password?: string;
  customId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Scheduled' | 'In Progress';
  price: number;
  type?: string;
  isVirtual?: boolean;
  notes?: string;
  specialty?: string;
  createdAt?: string;
}

class MockDatabase {
  private static instance: MockDatabase;
  private users: User[] = [];
  private appointments: Appointment[] = [];
  private storageKey = 'hospital_db_state';

  private constructor() {
    this.loadFromStorage();
    if (this.users.length === 0) {
      this.seedData();
    }
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.users = data.users || [];
        this.appointments = data.appointments || [];
      } catch (e) {
        console.error("Failed to parse MockDatabase storage", e);
      }
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify({
      users: this.users,
      appointments: this.appointments
    }));
  }

  private seedData() {
    this.users = [
      { id: "1", name: "Sarah Johnson", email: "sarah.j@example.com", role: "Patient", status: "Active", joined: "Jan 12, 2024", lastActive: "2 hours ago" },
      { id: "2", name: "Dr. Michael Smith", email: "m.smith@med.com", role: "Doctor", status: "Active", joined: "Feb 05, 2024", lastActive: "1 day ago", verified: true },
      { id: "3", name: "PharmaPlus North", email: "contact@pharmaplus.com", role: "Pharmacy", status: "Pending", joined: "Feb 08, 2024", lastActive: "Never" },
      { id: "4", name: "Robert Wilson", email: "r.wilson@mail.com", role: "Patient", status: "Suspended", joined: "Dec 15, 2023", lastActive: "2 weeks ago" },
      { id: "5", name: "Dr. Elena Popova", email: "e.popova@clinic.org", role: "Doctor", status: "Active", joined: "Jan 28, 2024", lastActive: "5 hours ago", verified: true },
    ];
    
    this.appointments = [
      { id: "APT-001", patientId: "1", patientName: "Sarah Johnson", doctorId: "2", doctorName: "Dr. Michael Smith", date: "2024-02-15", time: "10:00 AM", status: "Pending", price: 120 },
      { id: "APT-002", patientId: "4", patientName: "Robert Wilson", doctorId: "5", doctorName: "Dr. Elena Popova", date: "2024-02-12", time: "02:30 PM", status: "Completed", price: 150 },
    ];
    this.persist();
  }

  // User Actions
  public getUsers() { return this.users; }
  
  public updateUserStatus(id: string, status: User['status']) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.status = status;
      this.persist();
      return user;
    }
    return null;
  }

  public deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    this.persist();
    return true;
  }

  public addUser(user: Omit<User, 'joined' | 'lastActive'>) {
    const newUser: User = {
      ...user,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      lastActive: 'Never'
    };
    this.users.push(newUser);
    this.persist();
    return newUser;
  }

  // Appointment Actions
  public getAppointments() { return this.appointments; }
  
  public addAppointment(apt: Omit<Appointment, 'id'>) {
    const newApt = { ...apt, id: `APT-${Math.floor(Math.random() * 10000)}` };
    this.appointments.push(newApt);
    this.persist();
    return newApt;
  }

  // Stats
  public getStats() {
    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.status === 'Active').length,
      appointmentsToday: this.appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
      revenue: this.appointments.filter(a => a.status === 'Completed').reduce((sum, a) => sum + a.price, 0)
    };
  }
}

export const db = MockDatabase.getInstance();
