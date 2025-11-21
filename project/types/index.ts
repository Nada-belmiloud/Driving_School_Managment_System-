export type LicenseCategory = 'A1' | 'A2' | 'B' | 'C1' | 'C2' | 'D';

export type Phase = 'highway_code' | 'parking' | 'driving';

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export interface Document {
  name: string;
  checked: boolean;
}

export interface PhaseProgress {
  phase: Phase;
  status: PhaseStatus;
  sessionsCompleted: number;
  sessionsPlan: number;
  examDate?: string;
  examPassed?: boolean;
  examAttempts: number;
  lastExamDate?: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'cash';
  note?: string;
}

export interface Candidate {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  licenseCategory: LicenseCategory;
  registrationDate: string;
  documents: Document[];
  payments: Payment[];
  totalFee: number;
  paidAmount: number;
  phases: PhaseProgress[];
  instructorId?: string;
  status: 'active' | 'completed' | 'inactive';
  sessionHistory: Session[];
  examHistory: ExamHistory[];
}

export interface CompletedCandidate {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  licenseCategory: LicenseCategory;
  registrationDate: string;
  completionDate: string;
  totalFee: number;
  paidAmount: number;
  payments: Payment[];
  sessionHistory: Session[];
  examHistory: ExamHistory[];
  instructorId?: string;
}

export interface Instructor {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleId?: string;
  workingHours: string;
  maxStudents: number;
  currentStudents: number;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  description: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
  instructorId?: string;
  maintenanceLogs: MaintenanceLog[];
}

export interface Session {
  id: string;
  candidateId: string;
  instructorId: string;
  phase: Phase;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ExamHistory {
  id: string;
  phase: Phase;
  date: string;
  attemptNumber: number;
  passed: boolean;
  notes?: string;
}

export type UserRole = 'manager' | 'instructor';

export interface User {
  id: string;
  role: UserRole;
  name: string;
}
