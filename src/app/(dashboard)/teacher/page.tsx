import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { Student, Attendance, Class } from '@/lib/types';
import { AttendanceManager } from '@/components/dashboard/attendance-manager';


async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));
    
    const attendanceDocs = await getDocs(collection(db, 'attendance'));
    const attendance = attendanceDocs.docs.map(doc => doc.data() as Attendance);

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));
    
    return { students, attendance, classes };
}


export default async function TeacherPage() {
  const { students, attendance, classes } = await getData();
  
  async function handleSaveAttendance(data: { studentId: string, status: 'Present' | 'Absent' | 'Late', date: string }[]) {
    'use server';
    try {
        const batch = writeBatch(db);
        data.forEach(att => {
             const attRef = doc(collection(db, 'attendance'));
             batch.set(attRef, att);
        });
        await batch.commit();
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to save attendance.' };
    }
  }

  return (
    <div className="space-y-6">
      <div className='flex items-center gap-2'>
        <ClipboardCheck className="h-8 w-8" />
        <h1 className="font-headline text-3xl font-bold">Attendance</h1>
      </div>
       <Card>
            <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Select a class and date to mark daily attendance.</CardDescription>
            </CardHeader>
            <CardContent>
                <AttendanceManager students={students} attendance={attendance} classes={classes} onSaveAttendance={handleSaveAttendance} />
            </CardContent>
        </Card>
    </div>
  );
}
