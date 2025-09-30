import type { Student, Teacher, Class, Subject, Fee, User, Mark, Exam, Attendance } from './types';
import { placeholderImages } from './placeholder-images.json';

export const users: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@mirera.ac.ke', role: 'Admin', avatarUrl: placeholderImages[0].imageUrl },
  { id: 'user-2', name: 'Dean User', email: 'dean@mirera.ac.ke', role: 'Dean', avatarUrl: placeholderImages[1].imageUrl },
  { id: 'user-3', name: 'Teacher User', email: 'teacher@mirera.ac.ke', role: 'Teacher', avatarUrl: placeholderImages[2].imageUrl },
  { id: 'user-4', name: 'Accountant User', email: 'accountant@mirera.ac.ke', role: 'Accountant', avatarUrl: placeholderImages[3].imageUrl },
];

export const students: Student[] = [
  { id: 'std-1', admissionNumber: 'MHS-001', name: 'Alice Johnson', classId: 'cls-1', guardianName: 'John Johnson', guardianPhone: '0712345678', avatarUrl: placeholderImages[4].imageUrl, dateOfBirth: '2008-05-10' },
  { id: 'std-2', admissionNumber: 'MHS-002', name: 'Bob Williams', classId: 'cls-1', guardianName: 'Jane Williams', guardianPhone: '0723456789', avatarUrl: placeholderImages[5].imageUrl, dateOfBirth: '2008-03-15' },
  { id: 'std-3', admissionNumber: 'MHS-003', name: 'Charlie Brown', classId: 'cls-2', guardianName: 'Chris Brown', guardianPhone: '0734567890', avatarUrl: placeholderImages[6].imageUrl, dateOfBirth: '2007-11-20' },
  { id: 'std-4', admissionNumber: 'MHS-004', name: 'Diana Miller', classId: 'cls-3', guardianName: 'David Miller', guardianPhone: '0745678901', avatarUrl: placeholderImages[7].imageUrl, dateOfBirth: '2009-01-30' },
  { id: 'std-5', admissionNumber: 'MHS-005', name: 'Ethan Davis', classId: 'cls-2', guardianName: 'Emily Davis', guardianPhone: '0756789012', avatarUrl: placeholderImages[8].imageUrl, dateOfBirth: '2007-09-05' },
];

export const teachers: Teacher[] = [
  { id: 'tch-1', staffId: 'TS-01', name: 'Mr. Peter Jones', subjectIds: ['sub-1', 'sub-2'], email: 'peter.jones@mirera.ac.ke', phone: '0701234567', avatarUrl: placeholderImages[9].imageUrl },
  { id: 'tch-2', staffId: 'TS-02', name: 'Ms. Susan White', subjectIds: ['sub-3', 'sub-4'], email: 'susan.white@mirera.ac.ke', phone: '0702345678', avatarUrl: placeholderImages[10].imageUrl },
  { id: 'tch-3', staffId: 'TS-03', name: 'Mr. Ken Omondi', subjectIds: ['sub-5', 'sub-6'], email: 'ken.omondi@mirera.ac.ke', phone: '0703456789', avatarUrl: placeholderImages[11].imageUrl },
];

export const classes: Class[] = [
  { id: 'cls-1', name: 'Form 1', stream: 'A', classTeacherId: 'tch-1' },
  { id: 'cls-2', name: 'Form 2', stream: 'B', classTeacherId: 'tch-2' },
  { id: 'cls-3', name: 'Form 3', stream: 'C', classTeacherId: 'tch-3' },
];

export const subjects: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', code: '121' },
  { id: 'sub-2', name: 'English', code: '101' },
  { id: 'sub-3', name: 'Kiswahili', code: '102' },
  { id: 'sub-4', name: 'Physics', code: '232' },
  { id: 'sub-5', name: 'Chemistry', code: '233' },
  { id: 'sub-6', name: 'Biology', code: '231' },
  { id: 'sub-7', name: 'History', code: '311' },
];

export const exams: Exam[] = [
    { id: 'exam-1', name: 'Term 1 Opener', term: '1', year: 2024 },
    { id: 'exam-2', name: 'Term 1 Mid-Term', term: '1', year: 2024 },
    { id: 'exam-3', name: 'Term 1 End-Term', term: '1', year: 2024 },
];

export const marks: Mark[] = [
  { studentId: 'std-1', subjectId: 'sub-1', examId: 'exam-1', score: 78 },
  { studentId: 'std-1', subjectId: 'sub-2', examId: 'exam-1', score: 82 },
  { studentId: 'std-1', subjectId: 'sub-3', examId: 'exam-1', score: 75 },
  { studentId: 'std-2', subjectId: 'sub-1', examId: 'exam-1', score: 65 },
  { studentId: 'std-2', subjectId: 'sub-2', examId: 'exam-1', score: 71 },
  { studentId: 'std-2', subjectId: 'sub-3', examId: 'exam-1', score: 68 },
];

export const fees: Fee[] = [
  { invoiceId: 'inv-001', studentId: 'std-1', amount: 50000, dueDate: '2024-09-01', paidAmount: 50000, balance: 0, status: 'Paid' },
  { invoiceId: 'inv-002', studentId: 'std-2', amount: 50000, dueDate: '2024-09-01', paidAmount: 25000, balance: 25000, status: 'Partial' },
  { invoiceId: 'inv-003', studentId: 'std-3', amount: 52000, dueDate: '2024-09-01', paidAmount: 0, balance: 52000, status: 'Unpaid' },
  { invoiceId: 'inv-004', studentId: 'std-4', amount: 48000, dueDate: '2024-09-01', paidAmount: 48000, balance: 0, status: 'Paid' },
];

export const attendance: Attendance[] = [
    { studentId: 'std-1', date: '2024-07-28', status: 'Present' },
    { studentId: 'std-2', date: '2024-07-28', status: 'Absent' },
    { studentId: 'std-1', date: '2024-07-29', status: 'Present' },
    { studentId: 'std-2', date: '2024-07-29', status: 'Present' },
];
