import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ClipboardCheck, PenSquare, Bot } from 'lucide-react';
import { AiReportGenerator } from '@/components/dashboard/ai-report-generator';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { Student, Subject, Exam, Mark, Attendance } from '@/lib/types';
import { MarkEntryForm } from '@/components/dashboard/mark-entry-form';
import { AttendanceManager } from '@/components/dashboard/attendance-manager';


async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const subjectDocs = await getDocs(collection(db, 'subjects'));
    const subjects = subjectDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Subject));

    const examDocs = await getDocs(collection(db, 'exams'));
    const exams = examDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Exam));
    
    const attendanceDocs = await getDocs(collection(db, 'attendance'));
    const attendance = attendanceDocs.docs.map(doc => doc.data() as Attendance);
    
    return { students, subjects, exams, attendance };
}


export default async function TeacherPage() {
  const { students, subjects, exams, attendance } = await getData();

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
      <h1 className="font-headline text-3xl font-bold">Teacher's Dashboard</h1>
       <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance"><ClipboardCheck className="mr-2 h-4 w-4" />Attendance</TabsTrigger>
          <TabsTrigger value="marks"><PenSquare className="mr-2 h-4 w-4" />Enter Marks</TabsTrigger>
          <TabsTrigger value="reports"><Bot className="mr-2 h-4 w-4" />AI Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>Mark daily attendance for your classes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AttendanceManager students={students} attendance={attendance} onSaveAttendance={handleSaveAttendance} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="marks" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>Enter Marks</CardTitle>
                <CardDescription>Input student marks for exams.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MarkEntryForm students={students} subjects={subjects} exams={exams} onSaveMark={handleSaveMark}/>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
            <AiReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
