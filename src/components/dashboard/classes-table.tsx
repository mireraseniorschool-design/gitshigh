'use client';

import type { Class, Teacher } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ClassesTable({ classes, teachers }: { classes: Class[], teachers: Teacher[] }) {
    
  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'Unassigned';
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class Name</TableHead>
          <TableHead>Stream</TableHead>
          <TableHead>Class Teacher</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell>{c.stream}</TableCell>
            <TableCell>{getTeacherName(c.classTeacherId)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
