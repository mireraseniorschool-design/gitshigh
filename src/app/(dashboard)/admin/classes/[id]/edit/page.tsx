import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Class, Teacher } from '@/lib/types';
import { notFound } from 'next/navigation';
import { EditClassForm } from '@/components/dashboard/edit-class-form';
import { z } from 'zod';

async function getData(classId: string) {
    const classDocRef = doc(db, 'classes', classId);
    const classDocSnap = await getDoc(classDocRef);

    if (!classDocSnap.exists()) {
        return { classData: null, teachers: [] };
    }
    const classData = { ...classDocSnap.data(), id: classDocSnap.id } as Class;

    const teacherDocs = await getDocs(collection(db, 'teachers'));
    const teachers = teacherDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Teacher));

    return { classData, teachers };
}

const updateClassSchema = z.object({
  name: z.string().min(1, 'Class name is required.'),
  stream: z.string().optional(),
  classTeacherId: z.string().min(1, 'Please assign a class teacher.'),
});

type UpdateClassData = z.infer<typeof updateClassSchema>;


export default async function EditClassPage({ params }: { params: { id: string } }) {
    const { classData, teachers } = await getData(params.id);

    if (!classData) {
        notFound();
    }
    
    async function handleUpdateClass(data: UpdateClassData) {
        'use server';
        try {
            const classRef = doc(db, 'classes', classData!.id);
            await updateDoc(classRef, data);

            return { success: true, message: "Class updated successfully!"};
        } catch (error) {
            console.error("Failed to update class:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            return { success: false, message: `Failed to update class: ${errorMessage}` };
        }
    }


    return (
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold">Edit Class</h1>
          <Card>
            <CardHeader>
              <CardTitle>{classData.name} {classData.stream}</CardTitle>
              <CardDescription>Update the class details and assign a different class teacher.</CardDescription>
            </CardHeader>
            <CardContent>
                <EditClassForm 
                    classData={classData} 
                    teachers={teachers} 
                    onUpdate={handleUpdateClass}
                />
            </CardContent>
          </Card>
        </div>
    );
}
