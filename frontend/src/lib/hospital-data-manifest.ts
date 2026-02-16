/**
 * Hospital Agent Data Manifest
 * ----------------------------
 * This file centralizes all application data structures, interfaces, and 
 * initial seed data. It serves as the primary reference for backend integration.
 * Each section is annotated with the corresponding API endpoint required 
 * for graduating to a real FastAPI/PostgreSQL stack.
 */

// ==========================================
// 1. IDENTITY & USER MANAGEMENT
// Required Endpoints:
// - POST /api/v1/auth/login
// - POST /api/v1/users (Register)
// - GET /api/v1/users/{id} (Profile)
// - PATCH /api/v1/users/{id} (Update Profile)
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Patient' | 'Doctor' | 'Pharmacy' | 'Admin';
  status: 'Active' | 'Pending' | 'Suspended';
  joined: string;
  lastActive: string;
  verified?: boolean;
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

export const USERS: User[] = [
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
  }
];

// ==========================================
// 2. CLINICAL APPOINTMENTS
// Required Endpoints:
// - GET /api/v1/appointments
// - POST /api/v1/appointments (Schedule)
// - PATCH /api/v1/appointments/{id}/status (Confirm/Cancel/Compete)
// - GET /api/v1/doctors/{id}/availability
// ==========================================

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

export const APPOINTMENTS: Appointment[] = [
  {
    id: "APT-001",
    patientId: "pat-1",
    patientName: "Sarah Johnson",
    doctorId: "doc-1",
    doctorName: "Dr. Michael Chen",
    specialty: "Cardiology",
    date: "2026-02-16",
    time: "10:00 AM",
    status: "Scheduled",
    type: "Follow-up",
    price: 150,
    isVirtual: true,
    createdAt: "2026-02-09",
  }
];

// ==========================================
// 3. MEDICAL RECORDS & CLINICAL DATA
// Required Endpoints:
// - GET /api/v1/patients/{id}/records
// - POST /api/v1/records (Create Encounter)
// - GET /api/v1/patients/{id}/lab-results
// - GET /api/v1/patients/{id}/prescriptions
// ==========================================

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

export const MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: "REC-001",
    patientId: "pat-1",
    patientName: "Sarah Johnson",
    doctorId: "doc-1",
    doctorName: "Dr. Michael Chen",
    date: "2026-02-09",
    diagnosis: "Hypertension - Stage 1",
    status: "Active",
    notes: "Blood pressure consistently elevated. Started on Lisinopril 10mg daily.",
    vitals: { bloodPressure: "142/90", heartRate: "78 bpm", temperature: "98.4°F", weight: "158 lbs" },
  }
];

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "PRE-001",
    patientId: "pat-1",
    patientName: "Sarah Johnson",
    doctorId: "doc-1",
    doctorName: "Dr. Michael Chen",
    date: "2026-02-09",
    medicines: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "3 months" },
      { name: "Aspirin", dosage: "81mg", frequency: "Once daily", duration: "Ongoing" },
    ],
    status: "Active",
  }
];

export const LAB_RESULTS: LabResult[] = [
  {
    id: "LAB-001",
    patientId: "pat-1",
    patientName: "Sarah Johnson",
    doctorId: "doc-1",
    doctorName: "Dr. Michael Chen",
    testName: "Complete Blood Count (CBC)",
    date: "2026-02-09",
    status: "Normal",
    results: "WBC: 7.2, RBC: 4.8, Hemoglobin: 14.2, Platelets: 250",
    notes: "All values within normal range.",
  }
];

// ==========================================
// 4. MESSAGING SYSTEM
// Required Endpoints:
// - GET /api/v1/messages/inbox
// - GET /api/v1/messages/sent
// - POST /api/v1/messages (Send Message)
// - PATCH /api/v1/messages/{id}/read
// ==========================================

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

export const MESSAGES: Message[] = [
  {
    id: "MSG-001",
    senderId: "pat-1",
    senderName: "Sarah Johnson",
    senderRole: "Patient",
    receiverId: "doc-1",
    receiverName: "Dr. Michael Chen",
    subject: "Question about medication",
    content: "Hi Dr. Chen, I wanted to ask about the dosage of my blood pressure medication.",
    timestamp: "2026-02-16T18:00:00Z",
    read: false,
    starred: false,
    category: "Medical",
  }
];

// ==========================================
// 5. BILLING & INVOICES
// Required Endpoints:
// - GET /api/v1/patients/{id}/invoices
// - POST /api/v1/invoices/pay
// - GET /api/v1/admin/revenue-stats
// ==========================================

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

export const INVOICES: Invoice[] = [
  {
    id: "INV-003",
    patientId: "pat-1",
    patientName: "Sarah Johnson",
    appointmentId: "APT-001",
    description: "Cardiology Follow-up - Dr. Michael Chen",
    amount: 150,
    status: "Pending",
    date: "2026-02-16",
    dueDate: "2026-02-23",
  }
];

// ==========================================
// 6. AUDIT LOGS & SECURITY
// Required Endpoints:
// - GET /api/v1/admin/audit-logs
// - POST /api/v1/admin/logs (Internal Monitoring)
// ==========================================

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  entity: string;
  timestamp: string;
  ip: string;
  severity: 'Low' | 'Medium' | 'High';
}

export const AUDIT_LOGS: AuditLog[] = [
  { 
    id: "L-001", 
    action: "User Login", 
    actor: "Admin Sarah", 
    entity: "System", 
    timestamp: "2026-02-16T20:15:00Z", 
    ip: "192.168.1.45", 
    severity: "Low" 
  }
];
