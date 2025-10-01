'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Student, Class } from '@/lib/types';
import { StudentsTable } from '@/components/dashboard/students-table';
import { Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


// Let's refactor the page. It will remain a server component to fetch data,
// and pass it to a new client component that will handle search and display.

// Let's create a client component to handle the filtering.
function StudentListClient({ students: initialStudents, classes }: { students: Student[], classes: Class[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const studentsWithClass = useMemo(() => initialStudents.map(student => {
    const className = classes.find(c => c.id === student.classId)?.name || 'N/A';
    const stream = classes.find(c => c.id === student.classId)?.stream || '';
    return {
        ...student,
        className: `${className} ${stream}`.trim()
    }
  }), [initialStudents, classes]);
  
  const filteredStudents = useMemo(() => {
    if (!searchTerm) {
      return studentsWithClass;
    }
    return studentsWithClass.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, studentsWithClass]);

  return (
     <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Student Roster</CardTitle>
              <CardDescription>View, search, and manage student records.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/students/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Student
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or admission no..."
              className="pl-8 sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <StudentsTable students={filteredStudents} basePath="/admin/students" />
        </CardContent>
      </Card>
  )
}


// The page itself can remain a server component for data fetching
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));
    
    return { students, classes };
}

export default async function AdminStudentsPage() {
  const { students, classes } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Manage Students</h1>
      <StudentListClient students={students} classes={classes} />
    </div>
  );
}
