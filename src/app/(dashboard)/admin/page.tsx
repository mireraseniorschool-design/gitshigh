import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Users, User, Book, Banknote } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Student, Teacher, Class, Fee } from '@/lib/types';
import { StudentsTable } from '@/components/dashboard/students-table';
import { TeachersTable } from '@/components/dashboard/teachers-table';
import { ClassesTable } from '@/components/dashboard/classes-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';


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
      <div>
        <Tabs defaultValue="students" className="w-full">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>
          <TabsContent value="students" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Students</CardTitle>
                        <CardDescription>View, search, and manage all student records.</CardDescription>
                    </div>
                    <Button asChild>
                      <Link href="/admin/students">
                        <Users className="mr-2 h-4 w-4" />
                        Go to Student Management
                      </Link>
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <StudentsTable students={students.slice(0, 5)} />
                 <p className="text-sm text-muted-foreground mt-4">Showing first 5 students. Go to the student management page to see all.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="teachers" className="mt-4">
            <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Teachers</CardTitle>
                        <CardDescription>Add, edit, or remove teacher records.</CardDescription>
                    </div>
                    <Button asChild>
                      <Link href="/admin/teachers/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Teacher
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                <TeachersTable teachers={teachers} basePath="/admin/teachers" />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="classes" className="mt-4">
            <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Classes</CardTitle>
                        <CardDescription>Create new classes and assign teachers.</CardDescription>
                    </div>
                     <Button asChild>
                      <Link href="/admin/classes/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Class
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                <ClassesTable classes={classes} teachers={teachers} basePath="/admin/classes" />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
