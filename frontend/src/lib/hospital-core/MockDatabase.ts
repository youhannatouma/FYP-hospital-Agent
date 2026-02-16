/**
 * MockDatabase Singleton
 * Centralized data store with localStorage persistence and event subscriptions.
 * All roles read/write from the same store for cross-role consistency.
 */

// ─── Interfaces ────────────────────────────────────────────────

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
  specialty?: string;
  phone?: string;
  avatar?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  rating?: number;
  reviewCount?: number;
  clinicAddress?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  address?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  insuranceProvider?: string;
  insurancePlan?: string;
  insuranceMemberId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending' | 'In Progress';
  type?: string;
  price: number;
  notes?: string;
  isVirtual?: boolean;
  createdAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'Patient' | 'Doctor' | 'Admin' | 'System';
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  category?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  status: 'Active' | 'Follow-up' | 'Recovered';
  notes?: string;
  prescriptions?: string[];
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
  };
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  status: 'Active' | 'Completed' | 'Cancelled';
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
  dueDate: string;
  paidDate?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testName: string;
  date: string;
  status: 'Normal' | 'Abnormal' | 'Pending';
  results?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  entity: string;
  timestamp: string;
  ip: string;
  severity: 'Low' | 'Medium' | 'High';
}

// ─── Event System ──────────────────────────────────────────────

type EventCallback = () => void;

class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string) {
    this.listeners.get(event)?.forEach(cb => cb());
    // Also emit a generic 'change' event
    if (event !== 'change') {
      this.listeners.get('change')?.forEach(cb => cb());
    }
  }
}

// ─── MockDatabase ──────────────────────────────────────────────

class MockDatabase {
  private static instance: MockDatabase;
  private users: User[] = [];
  private appointments: Appointment[] = [];
  private messages: Message[] = [];
  private records: MedicalRecord[] = [];
  private prescriptions: Prescription[] = [];
  private invoices: Invoice[] = [];
  private labResults: LabResult[] = [];
  private auditLogs: AuditLog[] = [];
  private storageKey = 'hospital_db_state';
  public events = new EventEmitter();

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
        this.messages = data.messages || [];
        this.records = data.records || [];
        this.prescriptions = data.prescriptions || [];
        this.invoices = data.invoices || [];
        this.labResults = data.labResults || [];
        this.auditLogs = data.auditLogs || [];
      } catch (e) {
        console.error("Failed to parse MockDatabase storage", e);
      }
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify({
      users: this.users,
      appointments: this.appointments,
      messages: this.messages,
      records: this.records,
      prescriptions: this.prescriptions,
      invoices: this.invoices,
      labResults: this.labResults,
      auditLogs: this.auditLogs,
    }));
  }

  /**
   * Reset and re-seed -- useful for development
   */
  public resetData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
    this.seedData();
    this.events.emit('change');
  }

  // ─── Seed Data ───────────────────────────────────────────────

  private seedData() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const tomorrow = formatDate(new Date(now.getTime() + 86400000));
    const nextWeek = formatDate(new Date(now.getTime() + 7 * 86400000));
    const yesterday = formatDate(new Date(now.getTime() - 86400000));
    const lastWeek = formatDate(new Date(now.getTime() - 7 * 86400000));
    const lastMonth = formatDate(new Date(now.getTime() - 30 * 86400000));

    // ── Users ──────────────────────────────────────────────────
    this.users = [
      {
        id: "admin-1",
        name: "Admin Sarah",
        email: "admin@hospital.com",
        role: "Admin",
        status: "Active",
        joined: "Jan 01, 2024",
        lastActive: "Active now",
        verified: true,
        phone: "+1 (555) 000-0001",
      },
      {
        id: "doc-1",
        name: "Dr. Michael Chen",
        email: "m.chen@hospital.com",
        role: "Doctor",
        status: "Active",
        joined: "Jan 15, 2024",
        lastActive: "1 hour ago",
        verified: true,
        specialty: "Cardiology",
        phone: "+1 (555) 100-0001",
        licenseNumber: "MD-2024-001",
        yearsOfExperience: 15,
        rating: 4.9,
        reviewCount: 324,
        clinicAddress: "Downtown Medical Center",
        bio: "Board-certified cardiologist with 15+ years of experience in interventional cardiology.",
      },
      {
        id: "doc-2",
        name: "Dr. Emily Watson",
        email: "e.watson@hospital.com",
        role: "Doctor",
        status: "Active",
        joined: "Feb 05, 2024",
        lastActive: "3 hours ago",
        verified: true,
        specialty: "General Practice",
        phone: "+1 (555) 100-0002",
        licenseNumber: "MD-2024-002",
        yearsOfExperience: 12,
        rating: 4.8,
        reviewCount: 512,
        clinicAddress: "Westside Clinic",
        bio: "Family medicine specialist focused on preventive care and chronic disease management.",
      },
      {
        id: "doc-3",
        name: "Dr. Raj Patel",
        email: "r.patel@hospital.com",
        role: "Doctor",
        status: "Active",
        joined: "Mar 01, 2024",
        lastActive: "5 hours ago",
        verified: true,
        specialty: "Endocrinology",
        phone: "+1 (555) 100-0003",
        licenseNumber: "MD-2024-003",
        yearsOfExperience: 20,
        rating: 4.7,
        reviewCount: 198,
        clinicAddress: "Central Hospital",
        bio: "Endocrinologist specializing in diabetes management and thyroid disorders.",
      },
      {
        id: "doc-4",
        name: "Dr. Sarah Kim",
        email: "s.kim@hospital.com",
        role: "Doctor",
        status: "Pending",
        joined: "Feb 10, 2024",
        lastActive: "Never",
        verified: false,
        specialty: "Dermatology",
        phone: "+1 (555) 100-0004",
        licenseNumber: "MD-2024-004",
        yearsOfExperience: 10,
        rating: 4.9,
        reviewCount: 287,
        clinicAddress: "Skin Health Clinic",
        bio: "Dermatologist with expertise in cosmetic and medical dermatology.",
      },
      {
        id: "pat-1",
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        role: "Patient",
        status: "Active",
        joined: "Jan 12, 2024",
        lastActive: "2 hours ago",
        phone: "(555) 123-4567",
        dateOfBirth: "1982-03-15",
        gender: "Female",
        bloodType: "O+",
        address: "456 Elm Street, Suite 12, San Francisco, CA 94102",
        allergies: ["Penicillin", "Sulfa Drugs"],
        chronicConditions: ["Hypertension", "Hyperlipidemia"],
        emergencyContact: "John Johnson",
        emergencyPhone: "(555) 987-6543",
        insuranceProvider: "BlueCross BlueShield",
        insurancePlan: "Premium Health Plus",
        insuranceMemberId: "BCB-4521-8837",
      },
      {
        id: "pat-2",
        name: "Robert Wilson",
        email: "r.wilson@mail.com",
        role: "Patient",
        status: "Active",
        joined: "Dec 15, 2023",
        lastActive: "1 day ago",
        phone: "(555) 234-5678",
        dateOfBirth: "1975-08-22",
        gender: "Male",
        bloodType: "A+",
        address: "789 Oak Ave, San Francisco, CA 94103",
        allergies: ["Latex"],
        chronicConditions: ["Type 2 Diabetes"],
        emergencyContact: "Mary Wilson",
        emergencyPhone: "(555) 876-5432",
        insuranceProvider: "Aetna",
        insurancePlan: "Gold Plan",
        insuranceMemberId: "AET-7832-1123",
      },
      {
        id: "pat-3",
        name: "Mike Johnson",
        email: "m.johnson@mail.com",
        role: "Patient",
        status: "Active",
        joined: "Feb 01, 2024",
        lastActive: "5 hours ago",
        phone: "(555) 345-6789",
        dateOfBirth: "1990-11-30",
        gender: "Male",
        bloodType: "B+",
        address: "321 Pine St, San Francisco, CA 94104",
        allergies: [],
        chronicConditions: ["Asthma"],
        emergencyContact: "Jane Johnson",
        emergencyPhone: "(555) 765-4321",
        insuranceProvider: "UnitedHealth",
        insurancePlan: "Standard",
        insuranceMemberId: "UH-9012-4456",
      },
    ];

    // ── Appointments ───────────────────────────────────────────
    this.appointments = [
      {
        id: "APT-001",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        doctorId: "doc-1",
        doctorName: "Dr. Michael Chen",
        specialty: "Cardiology",
        date: today,
        time: "10:00 AM",
        status: "Scheduled",
        type: "Follow-up",
        price: 150,
        isVirtual: true,
        createdAt: lastWeek,
      },
      {
        id: "APT-002",
        patientId: "pat-2",
        patientName: "Robert Wilson",
        doctorId: "doc-2",
        doctorName: "Dr. Emily Watson",
        specialty: "General Practice",
        date: tomorrow,
        time: "02:30 PM",
        status: "Scheduled",
        type: "Check-up",
        price: 100,
        isVirtual: false,
        createdAt: lastWeek,
      },
      {
        id: "APT-003",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        doctorId: "doc-3",
        doctorName: "Dr. Raj Patel",
        specialty: "Endocrinology",
        date: nextWeek,
        time: "09:00 AM",
        status: "Scheduled",
        type: "Consultation",
        price: 175,
        isVirtual: false,
        createdAt: yesterday,
      },
      {
        id: "APT-004",
        patientId: "pat-3",
        patientName: "Mike Johnson",
        doctorId: "doc-1",
        doctorName: "Dr. Michael Chen",
        specialty: "Cardiology",
        date: today,
        time: "11:30 AM",
        status: "Scheduled",
        type: "New Patient",
        price: 200,
        isVirtual: false,
        createdAt: lastWeek,
      },
      {
        id: "APT-005",
        patientId: "pat-2",
        patientName: "Robert Wilson",
        doctorId: "doc-3",
        doctorName: "Dr. Raj Patel",
        specialty: "Endocrinology",
        date: lastWeek,
        time: "10:00 AM",
        status: "Completed",
        type: "Follow-up",
        price: 175,
        isVirtual: false,
        createdAt: lastMonth,
      },
      {
        id: "APT-006",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        doctorId: "doc-2",
        doctorName: "Dr. Emily Watson",
        specialty: "General Practice",
        date: lastMonth,
        time: "03:00 PM",
        status: "Completed",
        type: "Annual Physical",
        price: 120,
        isVirtual: false,
        createdAt: lastMonth,
      },
      {
        id: "APT-007",
        patientId: "pat-3",
        patientName: "Mike Johnson",
        doctorId: "doc-2",
        doctorName: "Dr. Emily Watson",
        specialty: "General Practice",
        date: yesterday,
        time: "01:00 PM",
        status: "Cancelled",
        type: "Check-up",
        price: 100,
        isVirtual: false,
        createdAt: lastWeek,
        notes: "Patient cancelled due to schedule conflict",
      },
    ];

    // ── Messages ───────────────────────────────────────────────
    this.messages = [
      {
        id: "MSG-001",
        senderId: "pat-1",
        senderName: "Sarah Johnson",
        senderRole: "Patient",
        receiverId: "doc-1",
        receiverName: "Dr. Michael Chen",
        subject: "Question about medication",
        content: "Hi Dr. Chen, I wanted to ask about the dosage of my blood pressure medication. I've been experiencing some dizziness in the mornings. Should I adjust the timing?",
        timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
        read: false,
        starred: false,
        category: "Medical",
      },
      {
        id: "MSG-002",
        senderId: "doc-1",
        senderName: "Dr. Michael Chen",
        senderRole: "Doctor",
        receiverId: "pat-1",
        receiverName: "Sarah Johnson",
        subject: "Re: Follow-up appointment",
        content: "Dear Sarah, your test results look good. I'd like to schedule a follow-up next week to discuss the next steps in your treatment plan.",
        timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
        read: true,
        starred: true,
        category: "Medical",
      },
      {
        id: "MSG-003",
        senderId: "pat-2",
        senderName: "Robert Wilson",
        senderRole: "Patient",
        receiverId: "doc-2",
        receiverName: "Dr. Emily Watson",
        subject: "Prescription refill request",
        content: "Dr. Watson, I'm running low on my diabetes medication (Metformin 500mg). Could you please send a refill to my pharmacy?",
        timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
        read: false,
        starred: false,
        category: "Prescription",
      },
      {
        id: "MSG-004",
        senderId: "doc-2",
        senderName: "Dr. Emily Watson",
        senderRole: "Doctor",
        receiverId: "pat-2",
        receiverName: "Robert Wilson",
        subject: "Re: Prescription refill request",
        content: "Hi Robert, I've sent the refill to PharmaPlus on Oak Street. It should be ready for pickup tomorrow morning. Remember to take it with meals.",
        timestamp: new Date(now.getTime() - 20 * 3600000).toISOString(),
        read: true,
        starred: false,
        category: "Prescription",
      },
      {
        id: "MSG-005",
        senderId: "pat-3",
        senderName: "Mike Johnson",
        senderRole: "Patient",
        receiverId: "doc-1",
        receiverName: "Dr. Michael Chen",
        subject: "Pre-appointment questions",
        content: "Dr. Chen, I have my first appointment coming up. Should I bring any previous medical records? Also, should I fast before the visit?",
        timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(),
        read: true,
        starred: false,
        category: "General",
      },
      {
        id: "MSG-006",
        senderId: "admin-1",
        senderName: "Admin Sarah",
        senderRole: "Admin",
        receiverId: "doc-1",
        receiverName: "Dr. Michael Chen",
        subject: "Schedule update for next week",
        content: "Dr. Chen, please note that the conference room B will be unavailable next Tuesday for maintenance. Your afternoon appointments have been moved to Room 204.",
        timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(),
        read: true,
        starred: false,
        category: "Administrative",
      },
    ];

    // ── Medical Records ────────────────────────────────────────
    this.records = [
      {
        id: "REC-001",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        doctorId: "doc-1",
        doctorName: "Dr. Michael Chen",
        date: lastWeek,
        diagnosis: "Hypertension - Stage 1",
        status: "Active",
        notes: "Blood pressure consistently elevated. Started on Lisinopril 10mg daily.",
        vitals: { bloodPressure: "142/90", heartRate: "78 bpm", temperature: "98.4°F", weight: "158 lbs" },
      },
      {
        id: "REC-002",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        doctorId: "doc-2",
        doctorName: "Dr. Emily Watson",
        date: lastMonth,
        diagnosis: "Annual Physical - Normal",
        status: "Recovered",
        notes: "All vitals within normal range. Recommended increased physical activity.",
        vitals: { bloodPressure: "130/85", heartRate: "72 bpm", temperature: "98.6°F", weight: "160 lbs" },
      },
      {
        id: "REC-003",
        patientId: "pat-2",
        patientName: "Robert Wilson",
        doctorId: "doc-3",
        doctorName: "Dr. Raj Patel",
        date: lastWeek,
        diagnosis: "Type 2 Diabetes - Management",
        status: "Active",
        notes: "HbA1c at 7.2%. Continuing Metformin. Added dietary counseling.",
        vitals: { bloodPressure: "128/82", heartRate: "80 bpm", temperature: "98.5°F", weight: "195 lbs" },
      },
      {
        id: "REC-004",
        patientId: "pat-3",
        patientName: "Mike Johnson",
        doctorId: "doc-2",
        doctorName: "Dr. Emily Watson",
        date: lastMonth,
        diagnosis: "Asthma - Mild Persistent",
        status: "Follow-up",
        notes: "Prescribed albuterol inhaler. Follow up in 4 weeks.",
        vitals: { bloodPressure: "118/76", heartRate: "70 bpm", temperature: "98.6°F", weight: "172 lbs" },
      },
    ];

    // ── Prescriptions ──────────────────────────────────────────
    this.prescriptions = [
      {
        id: "PRE-001",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        doctorId: "doc-1",
        doctorName: "Dr. Michael Chen",
        date: lastWeek,
        medicines: [
          { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "3 months" },
          { name: "Aspirin", dosage: "81mg", frequency: "Once daily", duration: "Ongoing" },
        ],
        status: "Active",
      },
      {
        id: "PRE-002",
        patientId: "pat-2",
        patientName: "Robert Wilson",
        doctorId: "doc-3",
        doctorName: "Dr. Raj Patel",
        date: lastWeek,
        medicines: [
          { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "6 months" },
        ],
        status: "Active",
      },
      {
        id: "PRE-003",
        patientId: "pat-3",
        patientName: "Mike Johnson",
        doctorId: "doc-2",
        doctorName: "Dr. Emily Watson",
        date: lastMonth,
        medicines: [
          { name: "Albuterol Inhaler", dosage: "90mcg", frequency: "As needed", duration: "Ongoing" },
        ],
        status: "Active",
      },
    ];

    // ── Invoices ───────────────────────────────────────────────
    this.invoices = [
      {
        id: "INV-001",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        appointmentId: "APT-006",
        description: "Annual Physical - Dr. Emily Watson",
        amount: 120,
        status: "Paid",
        date: lastMonth,
        dueDate: lastMonth,
        paidDate: lastMonth,
      },
      {
        id: "INV-002",
        patientId: "pat-2",
        patientName: "Robert Wilson",
        appointmentId: "APT-005",
        description: "Endocrinology Follow-up - Dr. Raj Patel",
        amount: 175,
        status: "Paid",
        date: lastWeek,
        dueDate: lastWeek,
        paidDate: lastWeek,
      },
      {
        id: "INV-003",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        appointmentId: "APT-001",
        description: "Cardiology Follow-up - Dr. Michael Chen",
        amount: 150,
        status: "Pending",
        date: today,
        dueDate: nextWeek,
      },
      {
        id: "INV-004",
        patientId: "pat-3",
        patientName: "Mike Johnson",
        appointmentId: "APT-004",
        description: "Cardiology New Patient - Dr. Michael Chen",
        amount: 200,
        status: "Pending",
        date: today,
        dueDate: nextWeek,
      },
    ];

    // ── Lab Results ────────────────────────────────────────────
    this.labResults = [
      {
        id: "LAB-001",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        doctorId: "doc-1",
        doctorName: "Dr. Michael Chen",
        testName: "Complete Blood Count (CBC)",
        date: lastWeek,
        status: "Normal",
        results: "WBC: 7.2, RBC: 4.8, Hemoglobin: 14.2, Platelets: 250",
        notes: "All values within normal range.",
      },
      {
        id: "LAB-002",
        patientId: "pat-1",
        patientName: "Sarah Johnson",
        doctorId: "doc-1",
        doctorName: "Dr. Michael Chen",
        testName: "Lipid Panel",
        date: lastWeek,
        status: "Abnormal",
        results: "Total Cholesterol: 245, LDL: 160, HDL: 45, Triglycerides: 200",
        notes: "Elevated LDL and triglycerides. Dietary modifications recommended.",
      },
      {
        id: "LAB-003",
        patientId: "pat-2",
        patientName: "Robert Wilson",
        doctorId: "doc-3",
        doctorName: "Dr. Raj Patel",
        testName: "HbA1c",
        date: lastWeek,
        status: "Abnormal",
        results: "HbA1c: 7.2%",
        notes: "Slightly above target of 7.0%. Continue current medication and increase monitoring.",
      },
    ];

    // ── Audit Logs ─────────────────────────────────────────────
    this.auditLogs = [
      { id: "L-001", action: "User Login", actor: "Admin Sarah", entity: "System", timestamp: new Date(now.getTime() - 300000).toISOString(), ip: "192.168.1.45", severity: "Low" },
      { id: "L-002", action: "Appointment Created", actor: "Sarah Johnson", entity: "APT-001", timestamp: new Date(now.getTime() - 3600000).toISOString(), ip: "192.168.1.50", severity: "Low" },
      { id: "L-003", action: "Prescription Issued", actor: "Dr. Michael Chen", entity: "PRE-001", timestamp: new Date(now.getTime() - 7200000).toISOString(), ip: "192.168.1.12", severity: "Low" },
      { id: "L-004", action: "Data Export", actor: "Admin Sarah", entity: "Financial Logs", timestamp: new Date(now.getTime() - 86400000).toISOString(), ip: "10.0.0.5", severity: "Medium" },
    ];

    this.persist();
  }

  // ─── User Operations ─────────────────────────────────────────

  public getUsers() { return [...this.users]; }
  
  public getUserById(id: string) { return this.users.find(u => u.id === id) || null; }

  public getUsersByRole(role: User['role']) { return this.users.filter(u => u.role === role); }

  public getDoctors() { return this.users.filter(u => u.role === 'Doctor' && u.status === 'Active' && u.verified); }

  public getPendingDoctors() { return this.users.filter(u => u.role === 'Doctor' && u.status === 'Pending'); }

  public updateUserStatus(id: string, status: User['status']) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.status = status;
      this.persist();
      this.addAuditLog("Status Update", "Admin", `User ${user.name} → ${status}`);
      this.events.emit('users');
      return user;
    }
    return null;
  }

  public verifyDoctor(id: string) {
    const user = this.users.find(u => u.id === id);
    if (user && user.role === 'Doctor') {
      user.status = 'Active';
      user.verified = true;
      this.persist();
      this.addAuditLog("Doctor Verified", "Admin", `Doctor ${user.name} verified`);
      this.events.emit('users');
      return user;
    }
    return null;
  }

  public deleteUser(id: string) {
    const user = this.users.find(u => u.id === id);
    this.users = this.users.filter(u => u.id !== id);
    this.persist();
    if (user) {
      this.addAuditLog("User Deleted", "Admin", `User ${user.name} removed`);
    }
    this.events.emit('users');
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
    this.addAuditLog("User Created", "Admin", `User ${newUser.name} added`);
    this.events.emit('users');
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
      this.persist();
      this.events.emit('users');
      return user;
    }
    return null;
  }

  // ─── Appointment Operations ──────────────────────────────────

  public getAppointments() { return [...this.appointments]; }

  public getAppointmentsByPatient(patientId: string) {
    return this.appointments.filter(a => a.patientId === patientId);
  }

  public getAppointmentsByDoctor(doctorId: string) {
    return this.appointments.filter(a => a.doctorId === doctorId);
  }

  public getUpcomingAppointments(userId: string, role: 'Patient' | 'Doctor') {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments
      .filter(a => {
        const isUser = role === 'Patient' ? a.patientId === userId : a.doctorId === userId;
        return isUser && a.date >= today && a.status === 'Scheduled';
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  public addAppointment(apt: Omit<Appointment, 'id' | 'createdAt'>) {
    const newApt: Appointment = {
      ...apt,
      id: `APT-${String(this.appointments.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    this.appointments.push(newApt);
    this.persist();
    this.addAuditLog("Appointment Created", apt.patientName, `Appointment with ${apt.doctorName}`);
    // Auto-create an invoice for the appointment
    this.addInvoice({
      patientId: apt.patientId,
      patientName: apt.patientName,
      appointmentId: newApt.id,
      description: `${apt.type || 'Appointment'} - ${apt.doctorName}`,
      amount: apt.price,
      status: 'Pending',
      date: apt.date,
      dueDate: apt.date,
    });
    this.events.emit('appointments');
    return newApt;
  }

  public updateAppointmentStatus(id: string, status: Appointment['status']) {
    const apt = this.appointments.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      this.persist();
      this.addAuditLog("Appointment Updated", "System", `${apt.id} → ${status}`);
      // If completed, update the invoice
      if (status === 'Completed') {
        const invoice = this.invoices.find(i => i.appointmentId === id);
        if (invoice) {
          invoice.status = 'Pending';
          this.events.emit('invoices');
        }
      }
      // If cancelled, also cancel the invoice
      if (status === 'Cancelled') {
        const invoice = this.invoices.find(i => i.appointmentId === id);
        if (invoice && invoice.status === 'Pending') {
          invoice.amount = 0;
          invoice.status = 'Paid';
          this.events.emit('invoices');
        }
      }
      this.events.emit('appointments');
      return apt;
    }
    return null;
  }

  public rescheduleAppointment(id: string, newDate: string, newTime: string) {
    const apt = this.appointments.find(a => a.id === id);
    if (apt) {
      apt.date = newDate;
      apt.time = newTime;
      this.persist();
      this.addAuditLog("Appointment Rescheduled", apt.patientName, `${apt.id} → ${newDate} ${newTime}`);
      this.events.emit('appointments');
      return apt;
    }
    return null;
  }

  // ─── Message Operations ──────────────────────────────────────

  public getMessages() { return [...this.messages]; }

  public getMessagesByUser(userId: string) {
    return this.messages
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getInboxMessages(userId: string) {
    return this.messages
      .filter(m => m.receiverId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getUnreadCount(userId: string) {
    return this.messages.filter(m => m.receiverId === userId && !m.read).length;
  }

  public addMessage(msg: Omit<Message, 'id' | 'timestamp' | 'read' | 'starred'>) {
    const newMsg: Message = {
      ...msg,
      id: `MSG-${String(this.messages.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      read: false,
      starred: false,
    };
    this.messages.push(newMsg);
    this.persist();
    this.events.emit('messages');
    return newMsg;
  }

  public markMessageRead(id: string) {
    const msg = this.messages.find(m => m.id === id);
    if (msg) {
      msg.read = true;
      this.persist();
      this.events.emit('messages');
      return msg;
    }
    return null;
  }

  public toggleMessageStar(id: string) {
    const msg = this.messages.find(m => m.id === id);
    if (msg) {
      msg.starred = !msg.starred;
      this.persist();
      this.events.emit('messages');
      return msg;
    }
    return null;
  }

  // ─── Medical Record Operations ───────────────────────────────

  public getRecords() { return [...this.records]; }

  public getRecordsByPatient(patientId: string) {
    return this.records.filter(r => r.patientId === patientId);
  }

  public getRecordsByDoctor(doctorId: string) {
    return this.records.filter(r => r.doctorId === doctorId);
  }

  public addRecord(record: Omit<MedicalRecord, 'id'>) {
    const newRecord: MedicalRecord = {
      ...record,
      id: `REC-${String(this.records.length + 1).padStart(3, '0')}`,
    };
    this.records.push(newRecord);
    this.persist();
    this.addAuditLog("Medical Record Created", record.doctorName, `Record for ${record.patientName}`);
    this.events.emit('records');
    return newRecord;
  }

  public updateRecord(id: string, updates: Partial<MedicalRecord>) {
    const record = this.records.find(r => r.id === id);
    if (record) {
      Object.assign(record, updates);
      this.persist();
      this.events.emit('records');
      return record;
    }
    return null;
  }

  public deleteRecord(id: string) {
    const record = this.records.find(r => r.id === id);
    this.records = this.records.filter(r => r.id !== id);
    this.persist();
    if (record) {
      this.addAuditLog("Medical Record Deleted", record.doctorName, `Removed record for ${record.patientName}`);
    }
    this.events.emit('records');
    return true;
  }

  // ─── Prescription Operations ─────────────────────────────────

  public getPrescriptions() { return [...this.prescriptions]; }

  public getPrescriptionsByPatient(patientId: string) {
    return this.prescriptions.filter(p => p.patientId === patientId);
  }

  public getPrescriptionsByDoctor(doctorId: string) {
    return this.prescriptions.filter(p => p.doctorId === doctorId);
  }

  public addPrescription(prescription: Omit<Prescription, 'id'>) {
    const newPrescription: Prescription = {
      ...prescription,
      id: `PRE-${String(this.prescriptions.length + 1).padStart(3, '0')}`,
    };
    this.prescriptions.push(newPrescription);
    this.persist();
    this.addAuditLog("Prescription Issued", prescription.doctorName, `For ${prescription.patientName}`);
    this.events.emit('prescriptions');
    return newPrescription;
  }

  // ─── Invoice Operations ──────────────────────────────────────

  public getInvoices() { return [...this.invoices]; }

  public getInvoicesByPatient(patientId: string) {
    return this.invoices.filter(i => i.patientId === patientId);
  }

  public addInvoice(invoice: Omit<Invoice, 'id'>) {
    const newInvoice: Invoice = {
      ...invoice,
      id: `INV-${String(this.invoices.length + 1).padStart(3, '0')}`,
    };
    this.invoices.push(newInvoice);
    this.persist();
    this.events.emit('invoices');
    return newInvoice;
  }

  public payInvoice(id: string) {
    const invoice = this.invoices.find(i => i.id === id);
    if (invoice) {
      invoice.status = 'Paid';
      invoice.paidDate = new Date().toISOString().split('T')[0];
      this.persist();
      this.addAuditLog("Payment Received", invoice.patientName, `Invoice ${invoice.id} - $${invoice.amount}`);
      this.events.emit('invoices');
      return invoice;
    }
    return null;
  }

  // ─── Lab Result Operations ───────────────────────────────────

  public getLabResults() { return [...this.labResults]; }

  public getLabResultsByPatient(patientId: string) {
    return this.labResults.filter(l => l.patientId === patientId);
  }

  public addLabResult(result: Omit<LabResult, 'id'>) {
    const newResult: LabResult = {
      ...result,
      id: `LAB-${String(this.labResults.length + 1).padStart(3, '0')}`,
    };
    this.labResults.push(newResult);
    this.persist();
    this.events.emit('labResults');
    return newResult;
  }

  // ─── Audit Log Operations ────────────────────────────────────

  public getAuditLogs() { return [...this.auditLogs]; }

  public addAuditLog(action: string, actor: string, entity: string, severity: AuditLog['severity'] = 'Low') {
    const log: AuditLog = {
      id: `L-${String(this.auditLogs.length + 1).padStart(3, '0')}`,
      action,
      actor,
      entity,
      timestamp: new Date().toISOString(),
      ip: "192.168.1.1",
      severity,
    };
    this.auditLogs.push(log);
    this.persist();
    this.events.emit('auditLogs');
    return log;
  }

  // ─── Aggregated Stats ────────────────────────────────────────

  public getEmptyStats() {
    return {
      totalUsers: 0,
      totalPatients: 0,
      totalDoctors: 0,
      activeDoctors: 0,
      activeUsers: 0,
      pendingDoctors: 0,
      totalAppointments: 0,
      appointmentsToday: 0,
      scheduledAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      totalRevenue: 0,
      revenue: 0,
      totalMessages: 0,
      unreadMessages: 0,
    };
  }

  public getStats() {
    const today = new Date().toISOString().split('T')[0];
    const activeDoctors = this.users.filter(u => u.role === 'Doctor' && u.status === 'Active');
    const totalRevenue = this.invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    
    return {
      totalUsers: this.users.length,
      totalPatients: this.users.filter(u => u.role === 'Patient').length,
      totalDoctors: this.users.filter(u => u.role === 'Doctor').length,
      activeDoctors: activeDoctors.length,
      activeUsers: this.users.filter(u => u.status === 'Active').length,
      pendingDoctors: this.users.filter(u => u.role === 'Doctor' && u.status === 'Pending').length,
      totalAppointments: this.appointments.length,
      appointmentsToday: this.appointments.filter(a => a.date === today && a.status !== 'Cancelled').length,
      scheduledAppointments: this.appointments.filter(a => a.status === 'Scheduled').length,
      completedAppointments: this.appointments.filter(a => a.status === 'Completed').length,
      cancelledAppointments: this.appointments.filter(a => a.status === 'Cancelled').length,
      totalRevenue,
      revenue: totalRevenue, // Alias for Admin Dashboard
      totalMessages: this.messages.length,
      unreadMessages: this.messages.filter(m => !m.read).length,
    };
  }

  /**
   * Get stats specific to a doctor
   */
  public getDoctorStats(doctorId: string) {
    const today = new Date().toISOString().split('T')[0];
    const doctorApts = this.appointments.filter(a => a.doctorId === doctorId);
    const doctorPatientIds = new Set(doctorApts.map(a => a.patientId));
    return {
      totalPatients: doctorPatientIds.size,
      appointmentsToday: doctorApts.filter(a => a.date === today && a.status !== 'Cancelled').length,
      upcomingAppointments: doctorApts.filter(a => a.date >= today && a.status === 'Scheduled').length,
      completedAppointments: doctorApts.filter(a => a.status === 'Completed').length,
      unreadMessages: this.messages.filter(m => m.receiverId === doctorId && !m.read).length,
    };
  }

  /**
   * Get stats specific to a patient
   */
  public getPatientStats(patientId: string) {
    const patApts = this.appointments.filter(a => a.patientId === patientId);
    const today = new Date().toISOString().split('T')[0];
    return {
      upcomingAppointments: patApts.filter(a => a.date >= today && a.status === 'Scheduled').length,
      completedAppointments: patApts.filter(a => a.status === 'Completed').length,
      activePrescriptions: this.prescriptions.filter(p => p.patientId === patientId && p.status === 'Active').length,
      pendingInvoices: this.invoices.filter(i => i.patientId === patientId && i.status === 'Pending').length,
      unreadMessages: this.messages.filter(m => m.receiverId === patientId && !m.read).length,
    };
  }
}

export const db = MockDatabase.getInstance();
