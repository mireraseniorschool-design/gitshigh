
'use client';

import type { Student } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StudentWithClass extends Student {
    className?: string;
}

export function StudentsTable({ students, onEdit }: { students: StudentWithClass[], onEdit: (student: Student) => void }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Admission No.</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Guardian</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length > 0 ? students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{student.admissionNumber}</TableCell>
            <TableCell className="font-medium">{student.name}</TableCell>
            <TableCell className="hidden md:table-cell">
              {student.guardianName}
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
                  <DropdownMenuItem onSelect={() => onEdit(student)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No students found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
