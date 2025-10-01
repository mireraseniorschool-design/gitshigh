import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import type { Class } from '@/lib/types';
import { AddStudentForm } from '@/components/dashboard/add-student-form';
import { z } from 'zod';

async function getData() {
    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));
    return { classes };
}

const newStudentSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  admissionNumber: z.string().min(1, 'Admission number is required.'),
  dateOfBirth: z.string().min(1, 'Date of birth is required.'),
  classId: z.string().min(1, 'Please select a class.'),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
});

type NewStudentData = z.infer<typeof newStudentSchema>;


export default async function AddStudentPage() {
    const { classes } = await getData();

    async function handleAddStudent(data: NewStudentData) {
        'use server';
        try {
            const studentId = `std-${data.admissionNumber}`;
            const studentRef = doc(db, 'students', studentId);
            await setDoc(studentRef, {
                id: studentId,
                avatarUrl: `https://picsum.photos/seed/${data.admissionNumber}/200/300`,
                ...data
            });

            return { success: true, message: "Student added successfully!"};
        } catch (error) {
            console.error("Failed to add student:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            return { success: false, message: `Failed to add student: ${errorMessage}` };
        }
    }


    return (
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold">Add New Student</h1>
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment</CardTitle>
              <CardDescription>Fill in the details below to add a new student to the school.</CardDescription>
            </CardHeader>
            <CardContent>
                <AddStudentForm 
                    classes={classes} 
                    onAddStudent={handleAddStudent}
                />
            </CardContent>
          </Card>
        </div>
    );
}
