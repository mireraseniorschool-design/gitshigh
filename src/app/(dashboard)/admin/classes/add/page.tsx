import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import type { Teacher } from '@/lib/types';
import { AddClassForm } from '@/components/dashboard/add-class-form';
import { z } from 'zod';

async function getData() {
    const teacherDocs = await getDocs(collection(db, 'teachers'));
    const teachers = teacherDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Teacher));
    return { teachers };
}

const newClassSchema = z.object({
  name: z.string().min(1, 'Class name is required.'),
  stream: z.string().optional(),
  classTeacherId: z.string().min(1, 'Please assign a class teacher.'),
});

type NewClassData = z.infer<typeof newClassSchema>;


export default async function AddClassPage() {
    const { teachers } = await getData();

    async function handleAddClass(data: NewClassData) {
        'use server';
        try {
            const classId = `cls-${data.name.replace(/\s+/g, '-').toLowerCase()}-${data.stream?.toLowerCase() || 'default'}`;
            const classRef = doc(db, 'classes', classId);
            await setDoc(classRef, {
                id: classId,
                ...data
            });

            return { success: true, message: "Class added successfully!"};
        } catch (error) {
            console.error("Failed to add class:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            return { success: false, message: `Failed to add class: ${errorMessage}` };
        }
    }


    return (
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold">Add New Class</h1>
          <Card>
            <CardHeader>
              <CardTitle>Class Creation</CardTitle>
              <CardDescription>Fill in the details below to add a new class.</CardDescription>
            </CardHeader>
            <CardContent>
                <AddClassForm 
                    teachers={teachers} 
                    onAddClass={handleAddClass}
                />
            </CardContent>
          </Card>
        </div>
    );
}
