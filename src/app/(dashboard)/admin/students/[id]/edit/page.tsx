import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import type { Student, Class, Subject } from '@/lib/types';
import { notFound } from 'next/navigation';
import { EditStudentForm } from '@/components/dashboard/edit-student-form';
import { z } from 'zod';

async function getData(studentId: string) {
    const studentDocRef = doc(db, 'students', studentId);
    const studentDocSnap = await getDoc(studentDocRef);

    if (!studentDocSnap.exists()) {
        return { student: null, classes: [], subjects: [], studentSubjects: [] };
    }
    const student = { ...studentDocSnap.data(), id: studentDocSnap.id } as Student;

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));
    
    const subjectDocs = await getDocs(collection(db, 'subjects'));
    const subjects = subjectDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Subject));

    const studentSubjectsCol = collection(db, 'students', studentId, 'subjects');
    const studentSubjectDocs = await getDocs(studentSubjectsCol);
    const studentSubjects = studentSubjectDocs.docs.map(doc => doc.id);

    return { student, classes, subjects, studentSubjects };
}

const updateStudentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  classId: z.string().min(1, 'Please select a class.'),
  subjectIds: z.array(z.string()).min(1, 'Please select at least one subject.'),
});

type UpdateStudentData = z.infer<typeof updateStudentSchema>;

export default async function EditStudentPage({ params }: { params: { id: string } }) {
    const { student, classes, subjects, studentSubjects } = await getData(params.id);

    if (!student) {
        notFound();
    }
    
    async function handleUpdateStudent(data: UpdateStudentData) {
        'use server';
        try {
            const studentRef = doc(db, 'students', student!.id);
            await updateDoc(studentRef, { 
                name: data.name,
                classId: data.classId 
            });

            const studentSubjectsRef = collection(db, 'students', student!.id, 'subjects');
            // This is a simple approach. In a real app, you might want to diff the arrays
            // to avoid unnecessary writes. For now, we clear and re-add.
            const existingSubjects = await getDocs(studentSubjectsRef);
            for(const subDoc of existingSubjects.docs) {
                await updateDoc(subDoc.ref, { enrolled: false }); // or delete
            }
            for (const subjectId of data.subjectIds) {
                await setDoc(doc(studentSubjectsRef, subjectId), { enrolled: true });
            }

            return { success: true, message: "Student updated successfully!"};
        } catch (error) {
            console.error("Failed to update student:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            return { success: false, message: `Failed to update student: ${errorMessage}` };
        }
    }


    return (
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold">Edit Student</h1>
          <Card>
            <CardHeader>
              <CardTitle>{student.name}</CardTitle>
              <CardDescription>Update the student's details, class assignment, and subject registration.</CardDescription>
            </CardHeader>
            <CardContent>
                <EditStudentForm 
                    student={student} 
                    classes={classes} 
                    subjects={subjects} 
                    studentSubjects={studentSubjects}
                    onUpdate={handleUpdateStudent}
                />
            </CardContent>
          </Card>
        </div>
    );
}
