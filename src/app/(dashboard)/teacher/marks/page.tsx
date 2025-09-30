import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { PenSquare } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { Student, Subject, Exam, Mark } from '@/lib/types';
import { MarkEntryForm } from '@/components/dashboard/mark-entry-form';


async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const subjectDocs = await getDocs(collection(db, 'subjects'));
    const subjects = subjectDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Subject));

    const examDocs = await getDocs(collection(db, 'exams'));
    const exams = examDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Exam));
    
    return { students, subjects, exams };
}


export default async function TeacherMarksPage() {
  const { students, subjects, exams } = await getData();

  async function handleSaveMark(data: Omit<Mark, 'id'>) {
    'use server';
    try {
        const markRef = doc(collection(db, 'marks'));
        await writeBatch(db).set(markRef, data).commit();
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to save mark.' };
    }
  }
  
  return (
    <div className="space-y-6">
        <div className='flex items-center gap-2'>
            <PenSquare className="h-8 w-8" />
            <h1 className="font-headline text-3xl font-bold">Enter Marks</h1>
        </div>
        <Card>
            <CardHeader>
            <CardTitle>Enter Student Marks</CardTitle>
            <CardDescription>Input student marks for exams.</CardDescription>
            </CardHeader>
            <CardContent>
                <MarkEntryForm students={students} subjects={subjects} exams={exams} onSaveMark={handleSaveMark}/>
            </CardContent>
        </Card>
    </div>
  );
}

