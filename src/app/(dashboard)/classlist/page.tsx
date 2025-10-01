'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Student, Class } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ClassListGenerator } from '@/components/dashboard/class-list-generator';
import { List } from 'lucide-react';

export default function ClassListPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function getData() {
      try {
        const studentDocs = await getDocs(collection(db, 'students'));
        const studentsData = studentDocs.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));

        const classDocs = await getDocs(collection(db, 'classes'));
        const classesData = classDocs.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));
        
        classesData.sort((a, b) => a.name.localeCompare(b.name) || (a.stream || '').localeCompare(b.stream || ''));

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
        <div className="flex items-center gap-2">
            <List className="h-8 w-8" />
            <h1 className="font-headline text-3xl font-bold">Generate Class List</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Printable Class Lists</CardTitle>
            <CardDescription>Select a class to generate a printable list for various uses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-12 text-muted-foreground">Loading data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <List className="h-8 w-8" />
        <h1 className="font-headline text-3xl font-bold">Generate Class List</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Printable Class Lists</CardTitle>
          <CardDescription>Select a class to generate a printable list for various uses.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassListGenerator students={students} classes={classes} />
        </CardContent>
      </Card>
    </div>
  );
}
