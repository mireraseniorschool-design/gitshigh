'use client';

import type { Fee } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type StudentInfo = { id: string; name: string; admissionNumber: string };

export function FeeInvoicesTable({ fees, students }: { fees: Fee[], students: StudentInfo[] }) {
  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name || 'Unknown Student';
  };

  const getStatusVariant = (status: Fee['status']) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Partial':
        return 'secondary';
      case 'Unpaid':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice ID</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fees.map((fee) => (
          <TableRow key={fee.invoiceId}>
            <TableCell className="font-medium">{fee.invoiceId}</TableCell>
            <TableCell>{getStudentName(fee.studentId)}</TableCell>
            <TableCell>{fee.amount.toLocaleString()}</TableCell>
            <TableCell>{fee.paidAmount.toLocaleString()}</TableCell>
            <TableCell className={fee.balance > 0 ? 'text-destructive' : ''}>
              {fee.balance.toLocaleString()}
            </TableCell>
            <TableCell>{format(new Date(fee.dueDate), 'PPP')}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(fee.status)}>{fee.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
