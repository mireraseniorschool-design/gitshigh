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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer, MoreHorizontal, Pencil } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function FeeInvoicesTable({ fees, students, classes }: { fees: Fee[], students: Student[], classes: Class[] }) {
  const { toast } = useToast();
    
  const getStudentInfo = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };
  
  const getClassInfo = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name} ${cls.stream || ''}` : 'N/A';
  }

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

  const handlePrint = async (invoice: Fee) => {
    const student = getStudentInfo(invoice.studentId);
    if (!student) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find student details.' });
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
    doc.text(`Class: ${getClassInfo(student.classId)}`, 14, 50);

    doc.text(`Invoice ID: ${invoice.invoiceId}`, 150, 40);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, 150, 45);
    doc.text(`Due Date: ${format(new Date(invoice.dueDate), 'PPP')}`, 150, 50);


    (doc as any).autoTable({
        startY: 60,
        head: [['Description', 'Amount (KES)']],
        body: [
            ['School Fees', invoice.amount.toLocaleString()],
        ],
        foot: [
            ['Total Amount Due', invoice.amount.toLocaleString()],
            ['Amount Paid', invoice.paidAmount.toLocaleString()],
            [{ content: 'Balance Due', styles: { fontStyle: 'bold' } }, { content: invoice.balance.toLocaleString(), styles: { fontStyle: 'bold' } }],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
    });
    
    doc.save(`Invoice-${invoice.invoiceId}-${student.admissionNumber}.pdf`);
    toast({ title: 'Invoice Downloading', description: 'Your PDF invoice has started downloading.' });
  }

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
          <TableHead><span className='sr-only'>Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fees.map((fee) => (
          <TableRow key={fee.invoiceId}>
            <TableCell className="font-medium">{fee.invoiceId}</TableCell>
            <TableCell>{getStudentInfo(fee.studentId)?.name || 'Unknown'}</TableCell>
            <TableCell>{fee.amount.toLocaleString()}</TableCell>
            <TableCell>{fee.paidAmount.toLocaleString()}</TableCell>
            <TableCell className={fee.balance > 0 ? 'text-destructive' : ''}>
              {fee.balance.toLocaleString()}
            </TableCell>
            <TableCell>{format(new Date(fee.dueDate), 'PPP')}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(fee.status)}>{fee.status}</Badge>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/accountant/invoices/${fee.invoiceId}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Invoice
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handlePrint(fee)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
