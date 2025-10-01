
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
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useMemo, useState } from 'react';

// This is a new Client Component to handle state and user interactions.
function StudentListClient({ students: initialStudents, classes }: { students: Student[], classes: Class[] }) {
  'use client';
  
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
              <CardDescription>View, search, and manage all student records.</CardDescription>
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
            {Object.keys(groupedStudents).length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    <p>No students found matching your search.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
  )
}

// The main page component is now a Server Component that fetches data.
async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));
    
    // Sort students by admission number by default
    students.sort((a, b) => a.admissionNumber.localeCompare(b.admissionNumber));

    return { students, classes };
}

// This is the async Server Component for the page.
export default async function AdminStudentsPage() {
  const { students, classes } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Manage Students</h1>
      {/* The client component is rendered here with the fetched data */}
      <StudentListClient students={students} classes={classes} />
    </div>
  );
}
