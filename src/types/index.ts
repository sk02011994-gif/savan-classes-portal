export type Role = 'admin' | 'student';

export interface User {
  phone: string;
  name: string;
  role: Role;
  batchIds: string[];
  createdAt: number;
}

export interface Batch {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  adminPhone: string;
  studentPhones: string[];
  createdAt: number;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  present: string[];
  absent: string[];
}

export interface TestScore {
  [phone: string]: number;
}

export interface Test {
  id: string;
  name: string;
  date: string;
  maxMarks: number;
  scores: TestScore;
}

export type FeeStatus = 'paid' | 'pending' | 'overdue';

export interface FeePayment {
  id: string;
  amount: number;
  month: string; // YYYY-MM
  status: FeeStatus;
  paidAt?: number;
  dueDate: number;
  note?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  batchIds: string[]; // empty = all
  createdAt: number;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export type ContentType = 'video' | 'note' | 'assignment';

export interface Material {
  id: string;
  title: string;
  type: ContentType;
  url: string;
  description: string;
  createdAt: number;
}
