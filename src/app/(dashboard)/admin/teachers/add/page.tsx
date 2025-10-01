import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import type { Subject } from '@/lib/types';
import { AddTeacherForm } from '@/components/dashboard/add-teacher-form';
import { z } from 'zod';

async function getData() {
    const subjectDocs = await getDocs(collection(db, 'subjects'));
    const subjects = subjectDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Subject));
    return { subjects };
}

const newTeacherSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  staffId: z.string().min(1, 'Staff ID is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  subjectIds: z.array(z.string()).min(1, 'Select at least one subject.'),
});

type NewTeacherData = z.infer<typeof newTeacherSchema>;


export default async function AddTeacherPage() {
    const { subjects } = await getData();

    async function handleAddTeacher(data: NewTeacherData) {
        'use server';
        try {
            const teacherId = `tch-${data.staffId}`;
            const teacherRef = doc(db, 'teachers', teacherId);
            await setDoc(teacherRef, {
                id: teacherId,
                avatarUrl: '',
                ...data
            });

            return { success: true, message: "Teacher added successfully!"};
        } catch (error) {
            console.error("Failed to add teacher:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            return { success: false, message: `Failed to add teacher: ${errorMessage}` };
        }
    }


    return (
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold">Add New Teacher</h1>
          <Card>
            <CardHeader>
              <CardTitle>Teacher Enrollment</CardTitle>
              <CardDescription>Fill in the details below to add a new teacher to the school.</CardDescription>
            </CardHeader>
            <CardContent>
                <AddTeacherForm 
                    subjects={subjects} 
                    onAddTeacher={handleAddTeacher}
                />
            </CardContent>
          </Card>
        </div>
    );
}
