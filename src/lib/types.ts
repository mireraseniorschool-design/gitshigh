export type UserRole = 'Admin' | 'Dean' | 'Teacher' | 'Accountant';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
};

export type Student = {
  id: string;
  admissionNumber: string;
  name: string;
  classId: string;
  guardianName: string;
  guardianPhone: string;
  avatarUrl: string;
  dateOfBirth: string;
};

export type Teacher = {
  id: string;
  staffId: string;
  name: string;
  subjectIds: string[];
  email: string;
  phone: string;
  avatarUrl: string;
};

export type Class = {
  id: string;
  name: string;
  stream: string;
  classTeacherId: string;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
};

export type Exam = {
  id: string;
  name: string;
  term: string;
  year: number;
};

export type Mark = {
  studentId: string;
  subjectId: string;
  examId: string;
  score: number;
};

export type Fee = {
  invoiceId: string;
  studentId: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
};

export type Attendance = {
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
};

export type Payment = {
    paymentId: string;
    studentId: string;
    invoiceId: string;
    amount: number;
    date: string; // ISO date string
}
