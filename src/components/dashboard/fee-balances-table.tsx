'use client';

import type { Fee, Student, Class } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function FeeBalancesTable({ fees, students, classes }: { fees: Fee[], students: Student[], classes: Class[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const studentBalances = useMemo(() => {
        return students.map(student => {
            const studentFees = fees.filter(f => f.studentId === student.id);
            const totalBilled = studentFees.reduce((sum, f) => sum + f.amount, 0);
            const totalPaid = studentFees.reduce((sum, f) => sum + f.paidAmount, 0);
            const balance = totalBilled - totalPaid;
            const studentClass = classes.find(c => c.id === student.classId);
            return {
                ...student,
                balance,
                className: studentClass ? `${studentClass.name} ${studentClass.stream || ''}`.trim() : 'N/A',
            };
        }).filter(s => s.balance > 0); // Only show students with a balance
    }, [students, fees, classes]);

    const filteredBalances = useMemo(() => {
        if (!searchTerm) {
            return studentBalances;
        }
        return studentBalances.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, studentBalances]);

  return (
    <div className='space-y-4'>
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search student..."
              className="pl-8 sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className='border rounded-md'>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Admission No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Outstanding Balance (KES)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredBalances.length > 0 ? (
                    filteredBalances.map((student) => (
                    <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.admissionNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{student.className}</Badge>
                        </TableCell>
                        <TableCell className={cn('text-right font-bold', student.balance > 0 ? 'text-destructive' : '')}>
                            {student.balance.toLocaleString()}
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No outstanding balances or no students match your search.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
