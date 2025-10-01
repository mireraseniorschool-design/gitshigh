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
import { Search } from 'lucide-react';

// The data fetching part is now intended to be passed as props
// since we can't use async/await in a 'use client' component's main body
// for the initial render in this architecture.
// For this specific request, I will assume the page props with data are passed down.
// But looking at the file, it was a server component before.
// I will create a new client component to wrap the table and search.

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
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>View and manage student records. Use the search box to filter by name or admission number.</CardDescription>
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
          <StudentsTable students={filteredStudents} basePath="/dean/students" />
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

export default async function DeanStudentsPage() {
  const { students, classes } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Manage Students</h1>
      <StudentListClient students={students} classes={classes} />
    </div>
  );
}
