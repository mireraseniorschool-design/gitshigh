'use server';

import { db } from './firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { students, teachers, classes, subjects, exams, marks, fees, users, attendance } from './data';

export async function seedDatabase() {
  const batch = writeBatch(db);

  try {
    // Seed users
    const usersCol = collection(db, 'users');
    users.forEach(user => {
      const userRef = doc(usersCol, user.id);
      batch.set(userRef, user);
    });

    // Seed students
    const studentsCol = collection(db, 'students');
    students.forEach(student => {
      const studentRef = doc(studentsCol, student.id);
      batch.set(studentRef, student);
    });

    // Seed teachers
    const teachersCol = collection(db, 'teachers');
    teachers.forEach(teacher => {
      const teacherRef = doc(teachersCol, teacher.id);
      batch.set(teacherRef, teacher);
    });

    // Seed classes
    const classesCol = collection(db, 'classes');
    classes.forEach(classItem => {
      const classRef = doc(classesCol, classItem.id);
      batch.set(classRef, classItem);
    });

    // Seed subjects
    const subjectsCol = collection(db, 'subjects');
    subjects.forEach(subject => {
      const subjectRef = doc(subjectsCol, subject.id);
      batch.set(subjectRef, subject);
    });

    // Seed exams
    const examsCol = collection(db, 'exams');
    exams.forEach(exam => {
      const examRef = doc(examsCol, exam.id);
      batch.set(examRef, exam);
    });

    // Seed marks
    const marksCol = collection(db, 'marks');
    marks.forEach(mark => {
      // Create a composite key for marks if needed, or use auto-generated IDs
      const markRef = doc(collection(db, 'marks'));
      batch.set(markRef, mark);
    });

    // Seed fees
    const feesCol = collection(db, 'fees');
    fees.forEach(fee => {
      const feeRef = doc(feesCol, fee.invoiceId);
      batch.set(feeRef, fee);
    });
    
    // Seed attendance
    const attendanceCol = collection(db, 'attendance');
    attendance.forEach(att => {
        const attRef = doc(collection(db, 'attendance'));
        batch.set(attRef, att);
    });


    await batch.commit();
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error("Error seeding database: ", error);
    if (error instanceof Error) {
        return { success: false, message: `Error seeding database: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred while seeding the database.' };
  }
}
