import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Edit } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import type { Student, Subject, Exam, Mark, Class } from '@/lib/types';
import { ManageMarks } from '@/components/dashboard/manage-marks';

type MarkWithId = Mark & { id: string };

async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const subjectDocs = await getDocs(collection(db, 'subjects'));
    const subjects = subjectDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Subject));

    const examDocs = await getDocs(collection(db, 'exams'));
    const exams = examDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Exam));
    
    const marksDocs = await getDocs(collection(db, 'marks'));
    const marks = marksDocs.docs.map(doc => ({...doc.data(), id: doc.id } as MarkWithId));
    
    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));

    return { students, subjects, exams, marks, classes };
}

export default async function TeacherManageMarksPage() {
  const { students, subjects, exams, marks, classes } = await getData();

  async function handleUpdateMarks(updatedMarks: { markId: string, score: number }[]) {
    'use server';
    try {
        const batch = writeBatch(db);
        updatedMarks.forEach(mark => {
            const markRef = doc(db, 'marks', mark.markId);
            batch.update(markRef, { score: mark.score });
        });
        await batch.commit();
        return { success: true, message: 'Marks updated successfully!' };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to update marks: ${errorMessage}` };
    }
  }

  return (
    <div className="space-y-6">
        <div className='flex items-center gap-2'>
            <Edit className="h-8 w-8" />
            <h1 className="font-headline text-3xl font-bold">Manage Marks</h1>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>View and Edit Student Marks</CardTitle>
            <CardDescription>Filter by class, exam, and subject to view and update scores.</CardDescription>
            </CardHeader>
            <CardContent>
                <ManageMarks 
                    students={students} 
                    subjects={subjects} 
                    exams={exams} 
                    classes={classes}
                    initialMarks={marks}
                    onUpdateMarks={handleUpdateMarks}
                />
            </CardContent>
        </Card>
    </div>
  );
}
