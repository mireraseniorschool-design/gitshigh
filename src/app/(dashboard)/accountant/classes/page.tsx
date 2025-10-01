import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Class, Teacher } from '@/lib/types';
import { ClassesTable } from '@/components/dashboard/classes-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

async function getData() {
    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));

    const teacherDocs = await getDocs(collection(db, 'teachers'));
    const teachers = teacherDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Teacher));
    
    return { classes, teachers };
}

export default async function AccountantClassesPage() {
  const { classes, teachers } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold">Manage Classes</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>School Classes</CardTitle>
          <CardDescription>View classes and their assigned teachers.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassesTable classes={classes} teachers={teachers} basePath="/accountant/classes" />
        </CardContent>
      </Card>
    </div>
  );
}
