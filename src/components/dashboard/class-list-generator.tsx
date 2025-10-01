'use client';

import { useState } from 'react';
import type { Student, Class } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
}

export function ClassListGenerator({ students, classes }: { students: Student[], classes: Class[] }) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const { toast } = useToast();

  const filteredStudents = students
    .filter(s => s.classId === selectedClassId)
    .sort((a, b) => a.admissionNumber.localeCompare(b.admissionNumber));

  const reorderName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        const lastName = parts.pop();
        return `${lastName}, ${parts.join(' ')}`;
    }
    return name;
  }

  const handlePrint = async () => {
    if (!selectedClassId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a class to print.' });
      return;
    }
    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return;

    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text('GITS HIGH SCHOOL', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Class List: ${selectedClass.name} ${selectedClass.stream || ''}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

    const head = [['No.', 'Admission No.', 'Name', '', '', '', '', '', '']];
    const body = filteredStudents.map((student, index) => [
      index + 1,
      student.admissionNumber,
      reorderName(student.name),
      '', '', '', '', '', ''
    ]);

    doc.autoTable({
      startY: 30,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fontStyle: 'bold' },
    });

    doc.save(`ClassList-${selectedClass.name.replace(' ', '')}-${selectedClass.stream || ''}.pdf`);
    toast({ title: 'Downloading PDF', description: 'The class list is being downloaded.' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="w-full max-w-sm">
          <label htmlFor="class-select" className="text-sm font-medium">Select Class</label>
          <Select onValueChange={setSelectedClassId} value={selectedClassId}>
            <SelectTrigger id="class-select">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.stream || ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handlePrint} disabled={!selectedClassId || filteredStudents.length === 0}>
          <Printer className="mr-2 h-4 w-4" />
          Print List
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead>Admission No.</TableHead>
              <TableHead>Name (Surname, First)</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedClassId ? (
              filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>{reorderName(student.name)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No students found in this class.
                  </TableCell>
                </TableRow>
              )
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Please select a class to view the list.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
