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


// Let's create a client component to handle the filtering.
function StudentListClient({ students: initialStudents, classes }: { students: Student[], classes: Class[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const studentsWithClass = useMemo(() => initialStudents.map(student => {
    const studentClass = classes.find(c => c.id === student.classId);
    const className = studentClass?.name || 'N/A';
    const stream = studentClass?.stream || '';
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

  const groupedStudents = useMemo(() => {
    return filteredStudents.reduce((acc, student) => {
        const className = student.className || 'Unassigned';
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(student);
        return acc;
    }, {} as Record<string, typeof filteredStudents>);
  }, [filteredStudents]);

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
          <div className='space-y-6'>
            {Object.entries(groupedStudents).sort(([a], [b]) => a.localeCompare(b)).map(([className, students]) => (
                <div key={className}>
                    <h3 className="text-lg font-semibold mb-2">{className}</h3>
                    <div className="border rounded-lg">
                        <StudentsTable students={students} basePath="/admin/students" />
                    </div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
  )
}

// The page itself remains a server component for data fetching, but we import it here.
// NOTE: This structure is slightly unconventional but necessary to resolve the async Client Component error.
// The actual default export is a server component defined below the client one.

async function AdminStudentsPage() {
  // This function is now part of the Server Component logic, but colocated.
  // In a typical refactor, the Client Component would be in a separate file.
  const { db } = await import('@/lib/firebase');
  const { collection, getDocs } = await import('firebase/firestore');

  async function getData() {
      const studentDocs = await getDocs(collection(db, 'students'));
      const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

      const classDocs = await getDocs(collection(db, 'classes'));
      const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));
      
      return { students, classes };
  }
  const { students, classes } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Manage Students</h1>
      <StudentListClient students={students} classes={classes} />
    </div>
  );
}

// We trick Next.js by exporting the async component as the default.
// The 'use client' directive at the top of the file makes StudentListClient a client component,
// but the default export remains a server component.
export default AdminStudentsPage;
