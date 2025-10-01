'use client';

import React from 'react';
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
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

function StudentListClient({ students: initialStudents, classes }: { students: Student[], classes: Class[] }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const studentsWithClass = React.useMemo(() => initialStudents.map(student => {
    const studentClass = classes.find(c => c.id === student.classId);
    const className = studentClass?.name || 'N/A';
    const stream = studentClass?.stream || '';
    return {
        ...student,
        className: `${className} ${stream}`.trim()
    }
  }), [initialStudents, classes]);
  
  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) {
      return studentsWithClass;
    }
    return studentsWithClass.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, studentsWithClass]);

  const groupedStudents = React.useMemo(() => {
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
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">View Students</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Student Roster</CardTitle>
              <CardDescription>View and search all student records.</CardDescription>
            </div>
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
                        <StudentsTable students={students} basePath="/accountant/students" />
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
    </div>
  );
}

export default function AccountantStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function getData() {
      try {
        const studentDocs = await getDocs(collection(db, 'students'));
        const studentsData = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

        const classDocs = await getDocs(collection(db, 'classes'));
        const classesData = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));
        
        studentsData.sort((a, b) => a.admissionNumber.localeCompare(b.admissionNumber));

        setStudents(studentsData);
        setClasses(classesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  if (loading) {
    return (
        <div className="space-y-6">
            <h1 className="font-headline text-3xl font-bold">View Students</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Student Roster</CardTitle>
                    <CardDescription>View and search all student records.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-12">Loading students...</div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return <StudentListClient students={students} classes={classes} />;
}
