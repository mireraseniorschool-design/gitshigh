import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Teacher } from '@/lib/types';
import { TeachersTable } from '@/components/dashboard/teachers-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

async function getData() {
    const teacherDocs = await getDocs(collection(db, 'teachers'));
    const teachers = teacherDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Teacher));
    return { teachers };
}

export default async function AccountantTeachersPage() {
  const { teachers } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold">Manage Teachers</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Teacher Roster</CardTitle>
          <CardDescription>View teacher records.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeachersTable teachers={teachers} basePath="/accountant/teachers" />
        </CardContent>
      </Card>
    </div>
  );
}
