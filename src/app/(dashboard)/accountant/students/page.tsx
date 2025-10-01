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
import type { Student, Class, Fee } from '@/lib/types';
import { StudentsTable } from '@/components/dashboard/students-table';
import { Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface StudentFinancials extends Student {
    className?: string;
    feePaid: number;
    feeBalance: number;
    invoiceId: string;
}


function StudentListClient({ students: initialStudents, classes, fees }: { students: Student[], classes: Class[], fees: Fee[] }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast();

  const studentsWithFinancials = React.useMemo(() => {
    return initialStudents.map(student => {
      const studentClass = classes.find(c => c.id === student.classId);
      const studentFee = fees.find(f => f.studentId === student.id);
      
      return {
          ...student,
          className: `${studentClass?.name || 'N/A'} ${studentClass?.stream || ''}`.trim(),
          feePaid: studentFee?.paidAmount || 0,
          feeBalance: studentFee?.balance || 0,
          invoiceId: studentFee?.invoiceId || 'N/A',
      }
    })
  }, [initialStudents, classes, fees]);
  
  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) {
      return studentsWithFinancials;
    }
    return studentsWithFinancials.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, studentsWithFinancials]);

  const groupedStudents = React.useMemo(() => {
    return filteredStudents.reduce((acc, student) => {
        const className = student.className || 'Unassigned';
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(student);
        return acc;
    }, {} as Record<string, StudentFinancials[]>);
  }, [filteredStudents]);

  const handlePrint = async (student: StudentFinancials) => {
    const fee = fees.find(f => f.invoiceId === student.invoiceId);
    if (!student || !fee) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find student or fee details.' });
        return;
    }

    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('GITS HIGH SCHOOL', 14, 22);
    doc.setFontSize(12);
    doc.text('FEE INVOICE', 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Student: ${student.name}`, 14, 40);
    doc.text(`Admission No: ${student.admissionNumber}`, 14, 45);
    doc.text(`Class: ${student.className}`, 14, 50);

    doc.text(`Invoice ID: ${fee.invoiceId}`, 150, 40);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, 150, 45);
    doc.text(`Due Date: ${format(new Date(fee.dueDate), 'PPP')}`, 150, 50);


    (doc as any).autoTable({
        startY: 60,
        head: [['Description', 'Amount (KES)']],
        body: [
            ['School Fees', fee.amount.toLocaleString()],
        ],
        foot: [
            ['Total Amount Due', fee.amount.toLocaleString()],
            ['Amount Paid', fee.paidAmount.toLocaleString()],
            [{ content: 'Balance Due', styles: { fontStyle: 'bold' } }, { content: fee.balance.toLocaleString(), styles: { fontStyle: 'bold' } }],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
    });
    
    doc.save(`Invoice-${fee.invoiceId}-${student.admissionNumber}.pdf`);
    toast({ title: 'Invoice Downloading', description: 'Your PDF invoice has started downloading.' });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Student Financials</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Student Accounts</CardTitle>
              <CardDescription>View financial summaries for all students, class by class.</CardDescription>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Adm No.</TableHead>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead className="text-right">Fee Paid (KES)</TableHead>
                                <TableHead className="text-right">Fee Balance (KES)</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="hidden sm:table-cell">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={student.avatarUrl} alt={student.name} />
                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.admissionNumber}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{student.invoiceId}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{student.feePaid.toLocaleString()}</TableCell>
                                    <TableCell className={cn('text-right font-bold', student.feeBalance > 0 ? 'text-destructive' : 'text-primary')}>
                                        {student.feeBalance.toLocaleString()}
                                    </TableCell>
                                     <TableCell className="text-center">
                                        <Button variant="outline" size="sm" onClick={() => handlePrint(student)} disabled={student.invoiceId === 'N/A'}>
                                            <Printer className="mr-2 h-4 w-4" />
                                            Invoice
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
  const [fees, setFees] = React.useState<Fee[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function getData() {
      try {
        const studentDocs = await getDocs(collection(db, 'students'));
        const studentsData = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

        const classDocs = await getDocs(collection(db, 'classes'));
        const classesData = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));

        const feeDocs = await getDocs(collection(db, 'fees'));
        const feesData = feeDocs.docs.map(doc => ({...doc.data() } as Fee));
        
        studentsData.sort((a, b) => a.admissionNumber.localeCompare(b.admissionNumber));

        setStudents(studentsData);
        setClasses(classesData);
        setFees(feesData);
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
            <h1 className="font-headline text-3xl font-bold">Student Financials</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Student Accounts</CardTitle>
                    <CardDescription>View financial summaries for all students, class by class.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-12">Loading student financials...</div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return <StudentListClient students={students} classes={classes} fees={fees} />;
}
