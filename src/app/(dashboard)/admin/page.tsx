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


// Dummy components for content
const StudentManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>Manage Students</CardTitle>
      <CardDescription>Add, edit, or remove student records.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Student management table and actions will be here.</p>
    </CardContent>
  </Card>
);
const TeacherManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>Manage Teachers</CardTitle>
      <CardDescription>Add, edit, or remove teacher records.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Teacher management table and actions will be here.</p>
    </CardContent>
  </Card>
);
const ClassManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>Manage Classes</CardTitle>
      <CardDescription>Create new classes and assign teachers.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Class management table and actions will be here.</p>
    </CardContent>
  </Card>
);

async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => doc.data() as Student);

    const teacherDocs = await getDocs(collection(db, 'teachers'));
    const teachers = teacherDocs.docs.map(doc => doc.data() as Teacher);

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => doc.data() as Class);

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
            <StudentManagement />
          </TabsContent>
          <TabsContent value="teachers" className="mt-4">
            <TeacherManagement />
          </TabsContent>
          <TabsContent value="classes" className="mt-4">
            <ClassManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
