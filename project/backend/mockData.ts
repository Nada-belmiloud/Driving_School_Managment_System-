import { Candidate, Instructor, Vehicle, Session, User, LicenseCategory, ExamHistory, CompletedCandidate } from '../types';

export const LICENSE_CATEGORIES = [
  { value: 'A1' as LicenseCategory, label: 'A1', description: 'Light motorcycles, tricycles, quadricycles' },
  { value: 'A2' as LicenseCategory, label: 'A2', description: 'Larger motorcycles (categories B and C)' },
  { value: 'B' as LicenseCategory, label: 'B', description: 'Cars ≤ 3.5 tons, up to 8 passenger seats' },
  { value: 'C1' as LicenseCategory, label: 'C1', description: 'Trucks 3.5–19 tons' },
  { value: 'C2' as LicenseCategory, label: 'C2', description: 'Heavy trucks >19 tons' },
  { value: 'D' as LicenseCategory, label: 'D', description: 'Passenger transport vehicles >3.5 tons or >8 passengers' }
];

export const REQUIRED_DOCUMENTS = [
  'Birth certificate',
  'Residence certificate',
  '6 photos',
  'Medical certificate',
  'National ID copy',
  'Parental authorization (if under 19)'
];

export const TOTAL_FEE = 34000; // DZD

export const currentUser: User = {
  id: '1',
  role: 'manager',
  name: 'Ahmed Benali'
};

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Amina Khelifi',
    age: 22,
    phone: '+213 555 123 456',
    email: 'amina.khelifi@email.dz',
    licenseCategory: 'B',
    registrationDate: '2024-09-15',
    documents: [
      { name: 'Birth certificate', checked: true },
      { name: 'Residence certificate', checked: true },
      { name: '6 photos', checked: true },
      { name: 'Medical certificate', checked: true },
      { name: 'National ID copy', checked: true },
      { name: 'Parental authorization (if under 19)', checked: false }
    ],
    payments: [
      { id: 'p1', amount: 11333, date: '2024-09-15', method: 'cash', note: 'Phase 1 payment' },
      { id: 'p2', amount: 11333, date: '2024-10-01', method: 'cash', note: 'Phase 2 payment' }
    ],
    totalFee: 34000,
    paidAmount: 22666,
    phases: [
      { phase: 'highway_code', status: 'completed', sessionsCompleted: 25, sessionsPlan: 25, examPassed: true, examAttempts: 1, lastExamDate: '2024-09-30' },
      { phase: 'parking', status: 'in_progress', sessionsCompleted: 10, sessionsPlan: 15, examAttempts: 0, examDate: '2024-10-25' },
      { phase: 'driving', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 15, examAttempts: 0 }
    ],
    instructorId: '1',
    status: 'active',
    sessionHistory: [
      { id: 's1', candidateId: '1', instructorId: '1', phase: 'highway_code', date: '2024-09-16', time: '09:00', status: 'completed' },
      { id: 's2', candidateId: '1', instructorId: '1', phase: 'highway_code', date: '2024-09-17', time: '09:00', status: 'completed' },
      { id: 's3', candidateId: '1', instructorId: '1', phase: 'highway_code', date: '2024-09-18', time: '09:00', status: 'completed' },
      { id: 's4', candidateId: '1', instructorId: '1', phase: 'highway_code', date: '2024-09-19', time: '14:00', status: 'completed' },
      { id: 's5', candidateId: '1', instructorId: '1', phase: 'highway_code', date: '2024-09-20', time: '14:00', status: 'cancelled' },
      { id: 's6', candidateId: '1', instructorId: '1', phase: 'parking', date: '2024-10-05', time: '10:00', status: 'completed' },
      { id: 's7', candidateId: '1', instructorId: '1', phase: 'parking', date: '2024-10-08', time: '10:00', status: 'completed' },
      { id: 's8', candidateId: '1', instructorId: '1', phase: 'parking', date: '2024-10-10', time: '15:00', status: 'completed' },
      { id: 's9', candidateId: '1', instructorId: '1', phase: 'parking', date: '2024-10-12', time: '09:00', status: 'completed' },
      { id: 's10', candidateId: '1', instructorId: '1', phase: 'parking', date: '2024-10-15', time: '11:00', status: 'scheduled' }
    ],
    examHistory: [
      { id: 'e1', phase: 'highway_code', date: '2024-09-30', attemptNumber: 1, passed: true, notes: 'Excellent performance' }
    ]
  },
  {
    id: '2',
    name: 'Youcef Meziane',
    age: 19,
    phone: '+213 555 234 567',
    email: 'youcef.meziane@email.dz',
    licenseCategory: 'B',
    registrationDate: '2024-10-01',
    documents: [
      { name: 'Birth certificate', checked: true },
      { name: 'Residence certificate', checked: true },
      { name: '6 photos', checked: false },
      { name: 'Medical certificate', checked: true },
      { name: 'National ID copy', checked: true },
      { name: 'Parental authorization (if under 19)', checked: false }
    ],
    payments: [
      { id: 'p3', amount: 34000, date: '2024-10-01', method: 'cash', note: 'Full payment' }
    ],
    totalFee: 34000,
    paidAmount: 34000,
    phases: [
      { phase: 'highway_code', status: 'in_progress', sessionsCompleted: 18, sessionsPlan: 25, examAttempts: 0, examDate: '2024-10-20' },
      { phase: 'parking', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 15, examAttempts: 0 },
      { phase: 'driving', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 15, examAttempts: 0 }
    ],
    instructorId: '1',
    status: 'active',
    sessionHistory: [
      { id: 's11', candidateId: '2', instructorId: '1', phase: 'highway_code', date: '2024-10-02', time: '10:00', status: 'completed' },
      { id: 's12', candidateId: '2', instructorId: '1', phase: 'highway_code', date: '2024-10-03', time: '10:00', status: 'completed' },
      { id: 's13', candidateId: '2', instructorId: '1', phase: 'highway_code', date: '2024-10-05', time: '14:00', status: 'completed' },
      { id: 's14', candidateId: '2', instructorId: '1', phase: 'highway_code', date: '2024-10-07', time: '09:00', status: 'completed' },
      { id: 's15', candidateId: '2', instructorId: '1', phase: 'highway_code', date: '2024-10-09', time: '11:00', status: 'completed' }
    ],
    examHistory: []
  },
  {
    id: '3',
    name: 'Fatima Bouras',
    age: 25,
    phone: '+213 555 345 678',
    email: 'fatima.bouras@email.dz',
    licenseCategory: 'B',
    registrationDate: '2024-08-20',
    documents: [
      { name: 'Birth certificate', checked: true },
      { name: 'Residence certificate', checked: true },
      { name: '6 photos', checked: true },
      { name: 'Medical certificate', checked: true },
      { name: 'National ID copy', checked: true },
      { name: 'Parental authorization (if under 19)', checked: false }
    ],
    payments: [
      { id: 'p4', amount: 11333, date: '2024-08-20', method: 'cash' },
      { id: 'p5', amount: 11333, date: '2024-09-05', method: 'cash' },
      { id: 'p6', amount: 11334, date: '2024-10-10', method: 'cash' }
    ],
    totalFee: 34000,
    paidAmount: 34000,
    phases: [
      { phase: 'highway_code', status: 'completed', sessionsCompleted: 25, sessionsPlan: 25, examPassed: true, examAttempts: 1, lastExamDate: '2024-09-10' },
      { phase: 'parking', status: 'completed', sessionsCompleted: 15, sessionsPlan: 15, examPassed: true, examAttempts: 2, lastExamDate: '2024-10-15' },
      { phase: 'driving', status: 'in_progress', sessionsCompleted: 8, sessionsPlan: 15, examAttempts: 0, examDate: '2024-11-05' }
    ],
    instructorId: '2',
    status: 'active',
    sessionHistory: [
      { id: 's16', candidateId: '3', instructorId: '2', phase: 'highway_code', date: '2024-08-22', time: '09:00', status: 'completed' },
      { id: 's17', candidateId: '3', instructorId: '2', phase: 'highway_code', date: '2024-08-25', time: '10:00', status: 'completed' },
      { id: 's18', candidateId: '3', instructorId: '2', phase: 'parking', date: '2024-09-15', time: '14:00', status: 'completed' },
      { id: 's19', candidateId: '3', instructorId: '2', phase: 'parking', date: '2024-09-18', time: '10:00', status: 'completed' },
      { id: 's20', candidateId: '3', instructorId: '2', phase: 'parking', date: '2024-09-20', time: '11:00', status: 'cancelled' },
      { id: 's21', candidateId: '3', instructorId: '2', phase: 'driving', date: '2024-10-18', time: '09:00', status: 'completed' },
      { id: 's22', candidateId: '3', instructorId: '2', phase: 'driving', date: '2024-10-20', time: '10:00', status: 'completed' },
      { id: 's23', candidateId: '3', instructorId: '2', phase: 'driving', date: '2024-10-22', time: '15:00', status: 'completed' }
    ],
    examHistory: [
      { id: 'e2', phase: 'highway_code', date: '2024-09-10', attemptNumber: 1, passed: true, notes: 'Good understanding' },
      { id: 'e3', phase: 'parking', date: '2024-09-25', attemptNumber: 1, passed: false, notes: 'Need more practice with parallel parking' },
      { id: 'e4', phase: 'parking', date: '2024-10-15', attemptNumber: 2, passed: true, notes: 'Much improved!' }
    ]
  },
  {
    id: '4',
    name: 'Karim Hadj',
    age: 18,
    phone: '+213 555 456 789',
    email: 'karim.hadj@email.dz',
    licenseCategory: 'A1',
    registrationDate: '2024-10-10',
    documents: [
      { name: 'Birth certificate', checked: true },
      { name: 'Residence certificate', checked: false },
      { name: '6 photos', checked: true },
      { name: 'Medical certificate', checked: false },
      { name: 'National ID copy', checked: true },
      { name: 'Parental authorization (if under 19)', checked: true }
    ],
    payments: [
      { id: 'p7', amount: 11333, date: '2024-10-10', method: 'cash', note: 'First installment' }
    ],
    totalFee: 34000,
    paidAmount: 11333,
    phases: [
      { phase: 'highway_code', status: 'in_progress', sessionsCompleted: 10, sessionsPlan: 25, examAttempts: 0 },
      { phase: 'parking', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 15, examAttempts: 0 },
      { phase: 'driving', status: 'not_started', sessionsCompleted: 0, sessionsPlan: 15, examAttempts: 0 }
    ],
    instructorId: '3',
    status: 'active',
    sessionHistory: [
      { id: 's24', candidateId: '4', instructorId: '3', phase: 'highway_code', date: '2024-10-12', time: '10:00', status: 'completed' },
      { id: 's25', candidateId: '4', instructorId: '3', phase: 'highway_code', date: '2024-10-14', time: '10:00', status: 'completed' },
      { id: 's26', candidateId: '4', instructorId: '3', phase: 'highway_code', date: '2024-10-16', time: '14:00', status: 'completed' }
    ],
    examHistory: []
  },
  {
    id: '5',
    name: 'Salma Benhadj',
    age: 30,
    phone: '+213 555 567 890',
    email: 'salma.benhadj@email.dz',
    licenseCategory: 'C1',
    registrationDate: '2024-09-05',
    documents: [
      { name: 'Birth certificate', checked: true },
      { name: 'Residence certificate', checked: true },
      { name: '6 photos', checked: true },
      { name: 'Medical certificate', checked: true },
      { name: 'National ID copy', checked: true },
      { name: 'Parental authorization (if under 19)', checked: false }
    ],
    payments: [
      { id: 'p8', amount: 17000, date: '2024-09-05', method: 'cash' },
      { id: 'p9', amount: 17000, date: '2024-10-05', method: 'cash' }
    ],
    totalFee: 34000,
    paidAmount: 34000,
    phases: [
      { phase: 'highway_code', status: 'completed', sessionsCompleted: 25, sessionsPlan: 25, examPassed: true, examAttempts: 1, lastExamDate: '2024-09-25' },
      { phase: 'parking', status: 'completed', sessionsCompleted: 15, sessionsPlan: 15, examPassed: true, examAttempts: 1, lastExamDate: '2024-10-18' },
      { phase: 'driving', status: 'in_progress', sessionsCompleted: 5, sessionsPlan: 15, examAttempts: 0 }
    ],
    instructorId: '2',
    status: 'active',
    sessionHistory: [
      { id: 's27', candidateId: '5', instructorId: '2', phase: 'highway_code', date: '2024-09-06', time: '09:00', status: 'completed' },
      { id: 's28', candidateId: '5', instructorId: '2', phase: 'highway_code', date: '2024-09-08', time: '09:00', status: 'completed' },
      { id: 's29', candidateId: '5', instructorId: '2', phase: 'parking', date: '2024-09-28', time: '10:00', status: 'completed' },
      { id: 's30', candidateId: '5', instructorId: '2', phase: 'parking', date: '2024-10-01', time: '10:00', status: 'completed' },
      { id: 's31', candidateId: '5', instructorId: '2', phase: 'driving', date: '2024-10-22', time: '14:00', status: 'completed' }
    ],
    examHistory: [
      { id: 'e5', phase: 'highway_code', date: '2024-09-25', attemptNumber: 1, passed: true },
      { id: 'e6', phase: 'parking', date: '2024-10-18', attemptNumber: 1, passed: true }
    ]
  }
];

export const mockInstructors: Instructor[] = [
  {
    id: '1',
    name: 'Mohamed Cherif',
    phone: '+213 555 111 222',
    email: 'mohamed.cherif@ecole.dz',
    vehicleId: '1',
    workingHours: '9:00–17:00 (1h lunch at 12:00)',
    maxStudents: 15,
    currentStudents: 12
  },
  {
    id: '2',
    name: 'Rachid Belkacem',
    phone: '+213 555 222 333',
    email: 'rachid.belkacem@ecole.dz',
    vehicleId: '2',
    workingHours: '9:00–17:00 (1h lunch at 12:00)',
    maxStudents: 15,
    currentStudents: 14
  },
  {
    id: '3',
    name: 'Sofiane Lamri',
    phone: '+213 555 333 444',
    email: 'sofiane.lamri@ecole.dz',
    vehicleId: '3',
    workingHours: '9:00–17:00 (1h lunch at 12:00)',
    maxStudents: 15,
    currentStudents: 8
  }
];

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    brand: 'Renault',
    model: 'Symbol',
    licensePlate: '16-123-31',
    instructorId: '1',
    maintenanceLogs: [
      {
        id: 'm1',
        date: '2024-10-24',
        description: 'Weekly check: Oil level good, tire pressure adjusted, brakes tested, interior cleaned'
      },
      {
        id: 'm2',
        date: '2024-10-17',
        description: 'Weekly check: All systems normal, minor scratches noted on rear bumper'
      }
    ]
  },
  {
    id: '2',
    brand: 'Peugeot',
    model: '301',
    licensePlate: '16-456-31',
    instructorId: '2',
    maintenanceLogs: [
      {
        id: 'm3',
        date: '2024-10-10',
        description: 'Front left tire pressure low - adjusted. Oil change scheduled for next week'
      }
    ]
  },
  {
    id: '3',
    brand: 'Volkswagen',
    model: 'Polo',
    licensePlate: '16-789-31',
    instructorId: '3',
    maintenanceLogs: [
      {
        id: 'm4',
        date: '2024-10-24',
        description: 'Weekly inspection complete - excellent condition, all systems functioning properly'
      }
    ]
  }
];

export const mockSessions: Session[] = [
  {
    id: 's1',
    candidateId: '1',
    instructorId: '1',
    phase: 'parking',
    date: '2024-10-26',
    time: '10:00',
    status: 'scheduled'
  },
  {
    id: 's2',
    candidateId: '2',
    instructorId: '1',
    phase: 'highway_code',
    date: '2024-10-26',
    time: '14:00',
    status: 'scheduled'
  },
  {
    id: 's3',
    candidateId: '3',
    instructorId: '2',
    phase: 'driving',
    date: '2024-10-27',
    time: '09:00',
    status: 'scheduled'
  }
];

export const completedCandidates: CompletedCandidate[] = [
  {
    id: 'c1',
    name: 'Rachid Bencheikh',
    age: 28,
    phone: '+213 555 789 012',
    email: 'rachid.bencheikh@email.dz',
    licenseCategory: 'B',
    registrationDate: '2024-06-01',
    completionDate: '2024-09-18',
    totalFee: 34000,
    paidAmount: 34000,
    instructorId: '1',
    payments: [
      { id: 'hp1', amount: 11333, date: '2024-06-01', method: 'cash', note: 'First installment' },
      { id: 'hp2', amount: 11333, date: '2024-07-01', method: 'cash', note: 'Second installment' },
      { id: 'hp3', amount: 11334, date: '2024-08-01', method: 'cash', note: 'Final installment' }
    ],
    sessionHistory: [
      { id: 'hs1', candidateId: 'c1', instructorId: '1', phase: 'highway_code', date: '2024-06-03', time: '09:00', status: 'completed' },
      { id: 'hs2', candidateId: 'c1', instructorId: '1', phase: 'highway_code', date: '2024-06-05', time: '09:00', status: 'completed' },
      { id: 'hs3', candidateId: 'c1', instructorId: '1', phase: 'highway_code', date: '2024-06-07', time: '14:00', status: 'completed' },
      { id: 'hs4', candidateId: 'c1', instructorId: '1', phase: 'parking', date: '2024-07-10', time: '10:00', status: 'completed' },
      { id: 'hs5', candidateId: 'c1', instructorId: '1', phase: 'parking', date: '2024-07-12', time: '10:00', status: 'completed' },
      { id: 'hs6', candidateId: 'c1', instructorId: '1', phase: 'parking', date: '2024-07-15', time: '15:00', status: 'completed' },
      { id: 'hs7', candidateId: 'c1', instructorId: '1', phase: 'driving', date: '2024-08-20', time: '09:00', status: 'completed' },
      { id: 'hs8', candidateId: 'c1', instructorId: '1', phase: 'driving', date: '2024-08-22', time: '10:00', status: 'completed' },
      { id: 'hs9', candidateId: 'c1', instructorId: '1', phase: 'driving', date: '2024-08-25', time: '11:00', status: 'completed' }
    ],
    examHistory: [
      { id: 'he1', phase: 'highway_code', date: '2024-06-28', attemptNumber: 1, passed: true, notes: 'Excellent score' },
      { id: 'he2', phase: 'parking', date: '2024-07-25', attemptNumber: 1, passed: true, notes: 'Perfect execution' },
      { id: 'he3', phase: 'driving', date: '2024-09-18', attemptNumber: 1, passed: true, notes: 'Great driving skills' }
    ]
  },
  {
    id: 'c2',
    name: 'Leila Hamdani',
    age: 24,
    phone: '+213 555 890 123',
    email: 'leila.hamdani@email.dz',
    licenseCategory: 'B',
    registrationDate: '2024-05-15',
    completionDate: '2024-10-05',
    totalFee: 34000,
    paidAmount: 34000,
    instructorId: '2',
    payments: [
      { id: 'hp4', amount: 34000, date: '2024-05-15', method: 'cash', note: 'Full payment' }
    ],
    sessionHistory: [
      { id: 'hs10', candidateId: 'c2', instructorId: '2', phase: 'highway_code', date: '2024-05-17', time: '10:00', status: 'completed' },
      { id: 'hs11', candidateId: 'c2', instructorId: '2', phase: 'highway_code', date: '2024-05-20', time: '10:00', status: 'completed' },
      { id: 'hs12', candidateId: 'c2', instructorId: '2', phase: 'parking', date: '2024-06-25', time: '14:00', status: 'completed' },
      { id: 'hs13', candidateId: 'c2', instructorId: '2', phase: 'parking', date: '2024-06-28', time: '10:00', status: 'completed' },
      { id: 'hs14', candidateId: 'c2', instructorId: '2', phase: 'driving', date: '2024-08-15', time: '09:00', status: 'completed' },
      { id: 'hs15', candidateId: 'c2', instructorId: '2', phase: 'driving', date: '2024-08-18', time: '11:00', status: 'completed' }
    ],
    examHistory: [
      { id: 'he4', phase: 'highway_code', date: '2024-06-10', attemptNumber: 1, passed: true },
      { id: 'he5', phase: 'parking', date: '2024-07-15', attemptNumber: 1, passed: false, notes: 'Failed parallel parking' },
      { id: 'he6', phase: 'parking', date: '2024-08-02', attemptNumber: 2, passed: true, notes: 'Much improved' },
      { id: 'he7', phase: 'driving', date: '2024-09-20', attemptNumber: 1, passed: false, notes: 'Speed control issues' },
      { id: 'he8', phase: 'driving', date: '2024-10-05', attemptNumber: 2, passed: true, notes: 'Good improvement' }
    ]
  },
  {
    id: 'c3',
    name: 'Omar Belaidi',
    age: 32,
    phone: '+213 555 901 234',
    email: 'omar.belaidi@email.dz',
    licenseCategory: 'C1',
    registrationDate: '2024-04-10',
    completionDate: '2024-08-22',
    totalFee: 34000,
    paidAmount: 34000,
    instructorId: '3',
    payments: [
      { id: 'hp5', amount: 17000, date: '2024-04-10', method: 'cash', note: 'First payment' },
      { id: 'hp6', amount: 17000, date: '2024-05-20', method: 'cash', note: 'Final payment' }
    ],
    sessionHistory: [
      { id: 'hs16', candidateId: 'c3', instructorId: '3', phase: 'highway_code', date: '2024-04-12', time: '09:00', status: 'completed' },
      { id: 'hs17', candidateId: 'c3', instructorId: '3', phase: 'highway_code', date: '2024-04-15', time: '09:00', status: 'completed' },
      { id: 'hs18', candidateId: 'c3', instructorId: '3', phase: 'parking', date: '2024-05-20', time: '10:00', status: 'completed' },
      { id: 'hs19', candidateId: 'c3', instructorId: '3', phase: 'parking', date: '2024-05-25', time: '14:00', status: 'completed' },
      { id: 'hs20', candidateId: 'c3', instructorId: '3', phase: 'driving', date: '2024-07-01', time: '09:00', status: 'completed' },
      { id: 'hs21', candidateId: 'c3', instructorId: '3', phase: 'driving', date: '2024-07-05', time: '10:00', status: 'completed' }
    ],
    examHistory: [
      { id: 'he9', phase: 'highway_code', date: '2024-05-05', attemptNumber: 1, passed: true },
      { id: 'he10', phase: 'parking', date: '2024-06-20', attemptNumber: 1, passed: true },
      { id: 'he11', phase: 'driving', date: '2024-08-22', attemptNumber: 1, passed: true, notes: 'Professional driver' }
    ]
  }
];
