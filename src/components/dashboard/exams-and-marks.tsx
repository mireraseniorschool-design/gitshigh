'use client';
import { useState } from 'react';
import type { Exam, Mark, Student, Subject } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';

export function ExamsAndMarks({
  exams,
  marks,
  students,
  subjects,
}: {
  exams: Exam[];
  marks: Mark[];
  students: Student[];
  subjects: Subject[];
}) {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(exams[0]?.id || null);

  const filteredMarks = selectedExamId
    ? marks.filter((mark) => mark.examId === selectedExamId)
    : [];
  
  const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'N/A';
  const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || 'N/A';

  return (
    <div className="space-y-4">
      <div className='max-w-xs'>
        <Label htmlFor='exam-select'>Select Exam</Label>
        <Select
          value={selectedExamId || ''}
          onValueChange={(value) => setSelectedExamId(value)}
        >
            <SelectTrigger id='exam-select'>
                <SelectValue placeholder="Select an exam" />
            </SelectTrigger>
            <SelectContent>
            {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                {exam.name} - {exam.year}
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMarks.length > 0 ? (
            filteredMarks.map((mark, index) => (
              <TableRow key={`${mark.studentId}-${mark.subjectId}-${mark.examId}-${index}`}>
                <TableCell>{getStudentName(mark.studentId)}</TableCell>
                <TableCell>{getSubjectName(mark.subjectId)}</TableCell>
                <TableCell>{mark.score}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No marks found for the selected exam.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
