'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  studentId: z.string().min(1, 'Please select a student.'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
});

type StudentInfo = { id: string; name: string; admissionNumber: string };

export function LogPaymentForm({
  students,
  onLogPayment,
}: {
  students: StudentInfo[];
  onLogPayment: (data: { studentId: string; amount: number }) => Promise<{ success: boolean; message?: string }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      amount: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await onLogPayment(values);
    if (result.success) {
      toast({
        title: 'Payment Logged',
        description: 'The payment has been successfully recorded.',
      });
      form.reset();
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message || 'Failed to log payment.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.admissionNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount Paid</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            'Log Payment'
          )}
        </Button>
      </form>
    </Form>
  </change>
  <change>
    <file>src/app/(dashboard)/admin/page.tsx</file>
    <content><![CDATA[import {
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
                <CardTitle>Manage Students</CardTitle>
                <CardDescription>View and manage all student records.</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentsTable students={students} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="teachers" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>Manage Teachers</CardTitle>
                <CardDescription>Add, edit, or remove teacher records.</CardDescription>
                </CardHeader>
                <CardContent>
                <TeachersTable teachers={teachers} />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="classes" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>Manage Classes</CardTitle>
                <CardDescription>Create new classes and assign teachers.</CardDescription>
                </CardHeader>
                <CardContent>
                <ClassesTable classes={classes} teachers={teachers} />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
