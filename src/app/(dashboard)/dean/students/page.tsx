
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Student, Class, Subject } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { StudentListClient } from '@/components/dashboard/student-list-client';

type ServerActionData = {
    name: string;
    classId: string;
    subjectIds: string[];
    dateOfBirth: string;
    guardianName?: string;
    guardianPhone?: string;
}

async function getData() {
  const studentDocs = await getDocs(collection(db, 'students'));
  const studentsData = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

  const classDocs = await getDocs(collection(db, 'classes'));
  const classesData = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));
  
  const subjectDocs = await getDocs(collection(db, 'subjects'));
  const subjectsData = subjectDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Subject));

  return { students: studentsData, classes: classesData, subjects: subjectsData };
}

export default async function DeanStudentsPage() {
  const { students, classes, subjects } = await getData();
  
   async function handleUpdateStudent(studentId: string, data: ServerActionData) {
        'use server';
        try {
            const studentRef = doc(db, 'students', studentId);
            await updateDoc(studentRef, { 
                name: data.name,
                classId: data.classId,
                dateOfBirth: data.dateOfBirth,
                guardianName: data.guardianName,
                guardianPhone: data.guardianPhone,
            });

            const studentSubjectsRef = collection(db, 'students', studentId, 'subjects');
            const existingSubjectsSnapshot = await getDocs(studentSubjectsRef);
            const newSubjectIds = new Set(data.subjectIds);

            for (const subjectId of data.subjectIds) {
                 const subDocRef = doc(studentSubjectsRef, subjectId);
                await setDoc(subDocRef, { enrolled: true });
            }

            for (const subDoc of existingSubjectsSnapshot.docs) {
                if (!newSubjectIds.has(subDoc.id)) {
                    await updateDoc(subDoc.ref, { enrolled: false });
                }
            }

            return { success: true, message: "Student updated successfully!"};
        } catch (error) {
            console.error("Failed to update student:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            return { success: false, message: `Failed to update student: ${errorMessage}` };
        }
    };

  return <StudentListClient 
            students={students} 
            classes={classes} 
            subjects={subjects} 
            handleUpdateStudent={handleUpdateStudent}
            basePath="/dean"
        />;
}
