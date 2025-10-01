import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Student, Class } from '@/lib/types';
import { StudentsTable } from '@/components/dashboard/students-table';

async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));
    
    return { students, classes };
}

export default async function DeanStudentsPage() {
  const { students, classes } = await getData();

  const studentsWithClass = students.map(student => {
    const className = classes.find(c => c.id === student.classId)?.name || 'N/A';
    const stream = classes.find(c => c.id === student.classId)?.stream || '';
    return {
        ...student,
        className: `${className} ${stream}`.trim()
    }
  });


  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Manage Students</h1>
      <Card>
        <CardHeader>
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>View and manage student records. Select a student to edit their class or subjects.</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentsTable students={studentsWithClass} basePath="/dean/students" />
        </CardContent>
      </Card>
    </div>
  );
}
