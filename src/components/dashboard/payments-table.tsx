'use client';

import type { Payment, Student } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

export function PaymentsTable({ payments, students }: { payments: Payment[], students: Student[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const paymentsWithStudentNames = useMemo(() => {
        return payments.map(payment => {
            const student = students.find(s => s.id === payment.studentId);
            return {
                ...payment,
                studentName: student?.name || 'Unknown Student',
                admissionNumber: student?.admissionNumber || 'N/A'
            };
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent
    }, [payments, students]);

    const filteredPayments = useMemo(() => {
        if (!searchTerm) {
            return paymentsWithStudentNames;
        }
        return paymentsWithStudentNames.filter(p => 
            p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, paymentsWithStudentNames]);

  return (
     <div className='space-y-4'>
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by student, adm no, or payment ID..."
              className="pl-8 sm:w-[400px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className='border rounded-md'>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount (KES)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                        <TableRow key={payment.paymentId}>
                            <TableCell className="font-medium">{payment.paymentId}</TableCell>
                            <TableCell>{payment.studentName}</TableCell>
                            <TableCell>{payment.admissionNumber}</TableCell>
                            <TableCell>{format(new Date(payment.date), 'PPP')}</TableCell>
                            <TableCell className="text-right font-semibold">{payment.amount.toLocaleString()}</TableCell>
                        </TableRow>
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No payments found or no records match your search.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
