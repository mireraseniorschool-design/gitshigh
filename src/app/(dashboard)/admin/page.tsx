import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Users, User, Book, Banknote } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Student, Teacher, Class, Fee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';


async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const teacherDocs = await getDocs(collection(db, 'teachers'));
    const teachers = teacherDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Teacher));

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));

    const feeDocs = await getDocs(collection(db, 'fees'));
    const fees = feeDocs.docs.map(doc => doc.data() as Fee);
    
    return { students, teachers, classes, fees };
}

export default async function AdminPage() {
  const { students, teachers, classes, fees } = await getData();
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalFeesDue = fees.reduce((acc, fee) => acc + fee.balance, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Admin Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Active staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">Across all forms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Due</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {totalFeesDue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total outstanding balance</p>
          </CardContent>
        </Card>
      </div>
      <div className='grid gap-6 md:grid-cols-3'>
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Navigate to key management sections.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-20 justify-between">
                <Link href="/admin/students">
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-primary" />
                    <span className="font-semibold text-lg">Manage Students</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 justify-between">
                <Link href="/admin/teachers">
                  <div className="flex items-center gap-4">
                    <User className="h-8 w-8 text-primary" />
                    <span className="font-semibold text-lg">Manage Teachers</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 justify-between">
                <Link href="/admin/classes">
                  <div className="flex items-center gap-4">
                    <Book className="h-8 w-8 text-primary" />
                    <span className="font-semibold text-lg">Manage Classes</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
