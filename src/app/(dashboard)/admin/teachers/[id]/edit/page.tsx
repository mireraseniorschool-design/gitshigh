import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Teacher, Subject } from '@/lib/types';
import { notFound } from 'next/navigation';
import { EditTeacherForm } from '@/components/dashboard/edit-teacher-form';
import { z } from 'zod';

export async function generateStaticParams() {
  const teachersSnapshot = await getDocs(collection(db, 'teachers'));
  return teachersSnapshot.docs.map(doc => ({ id: doc.id }));
}

async function getData(teacherId: string) {
    const teacherDocRef = doc(db, 'teachers', teacherId);
    const teacherDocSnap = await getDoc(teacherDocRef);

    if (!teacherDocSnap.exists()) {
        return { teacher: null, subjects: [] };
    }
    const teacher = { ...teacherDocSnap.data(), id: teacherDocSnap.id } as Teacher;

    const subjectDocs = await getDocs(collection(db, 'subjects'));
    const subjects = subjectDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Subject));

    return { teacher, subjects };
}

const updateTeacherSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  staffId: z.string().min(1, "Staff ID is required."),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  subjectIds: z.array(z.string()).min(1, 'Please select at least one subject.'),
});

type UpdateTeacherData = z.infer<typeof updateTeacherSchema>;


export default async function EditTeacherPage({ params }: { params: { id: string } }) {
    const { teacher, subjects } = await getData(params.id);

    if (!teacher) {
        notFound();
    }
    
    async function handleUpdateTeacher(data: UpdateTeacherData) {
        'use server';
        try {
            const teacherRef = doc(db, 'teachers', teacher!.id);

            // If the staffId is changed, we can't simply update the document if the ID is derived from it.
            // For this implementation, we will just update the fields.
            // A more robust solution would involve moving the document, which is more complex.
            await updateDoc(teacherRef, data);

            return { success: true, message: "Teacher updated successfully!"};
        } catch (error) {
            console.error("Failed to update teacher:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            return { success: false, message: `Failed to update teacher: ${errorMessage}` };
        }
    }


    return (
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold">Edit Teacher</h1>
          <Card>
            <CardHeader>
              <CardTitle>{teacher.name}</CardTitle>
              <CardDescription>Update the teacher's details and subject assignments.</CardDescription>
            </CardHeader>
            <CardContent>
                <EditTeacherForm 
                    teacher={teacher} 
                    subjects={subjects} 
                    onUpdate={handleUpdateTeacher}
                />
            </CardContent>
          </Card>
        </div>
    );
}
