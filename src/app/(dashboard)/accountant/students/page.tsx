
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
import { Search, Edit, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface StudentFinancials extends Student {
    className?: string;
    totalBilled: number;
    totalPaid: number;
    balance: number;
    feeRecordId?: string;
}

function StudentListClient({ students: initialStudents, classes, fees: initialFees }: { students: Student[], classes: Class[], fees: Fee[] }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<StudentFinancials | null>(null);
  const [currentFees, setCurrentFees] = React.useState(initialFees);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const studentsWithFinancials = React.useMemo(() => {
    return initialStudents.map(student => {
      const studentClass = classes.find(c => c.id === student.classId);
      // Assuming one fee record per student for simplicity
      const studentFee = currentFees.find(f => f.studentId === student.id);
      
      return {
          ...student,
          className: `${studentClass?.name || 'N/A'} ${studentClass?.stream || ''}`.trim(),
          totalBilled: studentFee?.amount || 0,
          totalPaid: studentFee?.paidAmount || 0,
          balance: studentFee?.balance || 0,
          feeRecordId: studentFee?.invoiceId,
      }
    })
  }, [initialStudents, classes, currentFees]);
  
  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) {
      return studentsWithFinancials;
    }
    return studentsWithFinancials.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, studentsWithFinancials]);

  const handleEditClick = (student: StudentFinancials) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };
  
  const handleSaveChanges = async () => {
    if (!editingStudent || !editingStudent.feeRecordId) {
        toast({ variant: 'destructive', title: 'Error', description: 'No student or fee record selected for update.' });
        return;
    }
    setIsLoading(true);

    try {
        const feeRef = doc(db, 'fees', editingStudent.feeRecordId);
        
        if (editingStudent.totalPaid > editingStudent.totalBilled) {
            toast({ variant: 'destructive', title: 'Invalid amount', description: 'Paid amount cannot be greater than the total amount billed.' });
            setIsLoading(false);
            return;
        }

        const newBalance = editingStudent.totalBilled - editingStudent.totalPaid;
        const newStatus = newBalance <= 0 ? 'Paid' : (editingStudent.totalPaid > 0 ? 'Partial' : 'Unpaid');

        await updateDoc(feeRef, {
            amount: editingStudent.totalBilled,
            paidAmount: editingStudent.totalPaid,
            balance: newBalance,
            status: newStatus,
        });

        // Update local state to reflect changes immediately
        setCurrentFees(currentFees.map(fee => 
            fee.invoiceId === editingStudent.feeRecordId 
            ? { ...fee, amount: editingStudent.totalBilled, paidAmount: editingStudent.totalPaid, balance: newBalance, status: newStatus }
            : fee
        ));

        toast({ title: 'Success', description: 'Student account updated successfully.' });
        setIsModalOpen(false);
        setEditingStudent(null);
    } catch (error) {
        console.error("Failed to update student account:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({ variant: 'destructive', title: 'Update Failed', description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Student Accounts</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>All Student Accounts</CardTitle>
              <CardDescription>View and manage financial details for all students.</CardDescription>
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
          <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Adm No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Total Billed (KES)</TableHead>
                    <TableHead className="text-right">Total Paid (KES)</TableHead>
                    <TableHead className="text-right">Balance (KES)</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredStudents.sort((a,b) => a.admissionNumber.localeCompare(b.admissionNumber)).map((student) => (
                    <TableRow key={student.id}>
                        <TableCell>{student.admissionNumber}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.className}</TableCell>
                        <TableCell className="text-right">{student.totalBilled.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">{student.totalPaid.toLocaleString()}</TableCell>
                        <TableCell className={cn('text-right font-bold', student.balance > 0 ? 'text-destructive' : 'text-primary')}>
                            {student.balance.toLocaleString()}
                        </TableCell>
                         <TableCell className="text-center">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(student)} disabled={!student.feeRecordId}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
           {filteredStudents.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    <p>No students found matching your search.</p>
                </div>
            )}
        </CardContent>
      </Card>
        {editingStudent && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Account for {editingStudent.name}</DialogTitle>
                        <DialogDescription>
                            Update the total amount billed and the total amount paid for this student. The balance will be recalculated automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="total-billed" className="text-right">
                                Total Billed
                            </Label>
                            <Input
                                id="total-billed"
                                type="number"
                                value={editingStudent.totalBilled}
                                onChange={(e) => setEditingStudent({ ...editingStudent, totalBilled: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="total-paid" className="text-right">
                                Total Paid
                            </Label>
                            <Input
                                id="total-paid"
                                type="number"
                                value={editingStudent.totalPaid}
                                onChange={(e) => setEditingStudent({ ...editingStudent, totalPaid: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSaveChanges} disabled={isLoading}>
                             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
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
            <h1 className="font-headline text-3xl font-bold">Student Accounts</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Student Accounts</CardTitle>
                    <CardDescription>View and manage financial details for all students.</CardDescription>
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
