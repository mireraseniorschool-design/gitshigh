

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
import type { Student, Class, Subject } from '@/lib/types';
import { StudentsTable } from '@/components/dashboard/students-table';
import { Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { StudentDetailsModal } from '@/components/dashboard/student-details-modal';
import { useToast } from '@/hooks/use-toast';

interface StudentWithClass extends Student {
    className?: string;
}

type ServerActionData = {
    name: string;
    classId: string;
    subjectIds: string[];
    dateOfBirth: string;
    guardianName?: string;
    guardianPhone?: string;
}

function StudentListClient({ 
  students: initialStudents, 
  classes, 
  subjects,
  handleUpdateStudent
}: { 
  students: Student[], 
  classes: Class[], 
  subjects: Subject[],
  handleUpdateStudent: (studentId: string, data: ServerActionData) => Promise<{ success: boolean, message?: string }>
}) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [studentSubjects, setStudentSubjects] = React.useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toast } = useToast();
  
  const handleEdit = async (student: Student) => {
    try {
        const studentSubjectsCol = collection(db, 'students', student.id, 'subjects');
        const studentSubjectDocs = await getDocs(studentSubjectsCol);
        const subjectIds = studentSubjectDocs.docs.filter(doc => doc.data().enrolled).map(doc => doc.id);
        setStudentSubjects(subjectIds);
        setEditingStudent(student);
        setIsModalOpen(true);
    } catch (error) {
        console.error("Failed to fetch student subjects:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch student's subject data." });
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setStudentSubjects([]);
  }

  const studentsWithClass = React.useMemo(() => initialStudents.map(student => {
    const studentClass = classes.find(c => c.id === student.classId);
    const className = studentClass ? `${studentClass.name} ${studentClass.stream || ''}`.trim() : 'Unassigned';
    return {
        ...student,
        className
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
    const sortedStudents = [...filteredStudents].sort((a, b) => a.admissionNumber.localeCompare(b.admissionNumber));
    
    return sortedStudents.reduce((acc, student) => {
        const className = student.className || 'Unassigned';
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(student);
        return acc;
    }, {} as Record<string, StudentWithClass[]>);
  }, [filteredStudents]);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Manage Students</h1>
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
                        <StudentsTable students={students} onEdit={handleEdit} />
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
      {isModalOpen && editingStudent && (
        <StudentDetailsModal
            student={editingStudent}
            classes={classes}
            subjects={subjects}
            studentSubjects={studentSubjects}
            onUpdate={(data) => handleUpdateStudent(editingStudent.id, data)}
            isOpen={isModalOpen}
            onClose={handleModalClose}
        />
      )}
    </div>
  );
}


export default function AdminStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function getData() {
      try {
        const studentDocs = await getDocs(collection(db, 'students'));
        const studentsData = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

        const classDocs = await getDocs(collection(db, 'classes'));
        const classesData = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));

        const subjectDocs = await getDocs(collection(db, 'subjects'));
        const subjectsData = subjectDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Subject));
        
        setStudents(studentsData);
        setClasses(classesData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);
  
  async function handleUpdateStudent(studentId: string, data: ServerActionData) {
    'use server';
    try {
        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, { 
            name: data.name,
            classId: data.classId,
            dateOfBirth: data.dateOfBirth,
            guardianName: data.guardianName,
            guardianPhone: data.guardianPhone,
        });

        const studentSubjectsRef = collection(db, 'students', studentId, 'subjects');
        const existingSubjectsSnapshot = await getDocs(studentSubjectsRef);
        const newSubjectIds = new Set(data.subjectIds);

        // Add or update subjects
        for (const subjectId of data.subjectIds) {
            const subDocRef = doc(studentSubjectsRef, subjectId);
            await setDoc(subDocRef, { enrolled: true });
        }

        // Unenroll from subjects that were removed
        for (const subDoc of existingSubjectsSnapshot.docs) {
            if (!newSubjectIds.has(subDoc.id)) {
                await updateDoc(subDoc.ref, { enrolled: false });
            }
        }
        
        return { success: true, message: "Student updated successfully!"};
    } catch (error) {
        console.error("Failed to update student:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message: `Failed to update student: ${errorMessage}` };
    }
  }

  if (loading) {
     return (
        <div className="space-y-6">
            <h1 className="font-headline text-3xl font-bold">Manage Students</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Student Roster</CardTitle>
                    <CardDescription>View, search, and manage all student records.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-12">Loading students...</div>
                </CardContent>
            </Card>
        </div>
    );
  }


  return <StudentListClient students={students} classes={classes} subjects={subjects} handleUpdateStudent={handleUpdateStudent} />;
}
