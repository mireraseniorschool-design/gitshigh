'use client';
import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Student, Subject, Exam, Mark, Class } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type MarkWithId = Mark & { id: string };

const markUpdateSchema = z.object({
  markId: z.string(),
  score: z.coerce.number().min(0).max(100),
});

const formSchema = z.object({
  classId: z.string().min(1, 'Please select a class.'),
  examId: z.string().min(1, 'Please select an exam.'),
  subjectId: z.string().min(1, 'Please select a subject.'),
  marks: z.array(markUpdateSchema),
});

type FormData = z.infer<typeof formSchema>;

export function ManageMarks({
  students,
  subjects,
  exams,
  classes,
  initialMarks,
  onUpdateMarks,
}: {
  students: Student[];
  subjects: Subject[];
  exams: Exam[];
  classes: Class[];
  initialMarks: MarkWithId[];
  onUpdateMarks: (data: { markId: string; score: number }[]) => Promise<{ success: boolean; message?: string }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: '',
      examId: '',
      subjectId: '',
      marks: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "marks",
  });

  const classId = form.watch('classId');
  const examId = form.watch('examId');
  const subjectId = form.watch('subjectId');

  useEffect(() => {
    if (classId && examId && subjectId) {
      setIsFiltering(true);
      
      const classStudentIds = students.filter(s => s.classId === classId).map(s => s.id);

      const relevantMarks = initialMarks.filter(
        (mark) =>
          mark.examId === examId &&
          mark.subjectId === subjectId &&
          classStudentIds.includes(mark.studentId)
      );

      const studentMarksForForm = students
        .filter(student => classStudentIds.includes(student.id))
        .map(student => {
            const mark = relevantMarks.find(m => m.studentId === student.id);
            return {
                markId: mark?.id || `new-${student.id}`,
                studentName: student.name,
                studentId: student.id,
                score: mark?.score ?? 0,
            };
        })
        .filter(sm => sm.markId.startsWith('new-') === false); // Only show students who already have a mark

      replace(studentMarksForForm.map(m => ({ markId: m.markId, score: m.score, studentId: m.studentId, studentName: m.studentName })));
      setIsFiltering(false);
    } else {
      replace([]);
    }
  }, [classId, examId, subjectId, initialMarks, students, replace]);
  
  const studentData = useMemo(() => {
     return fields.map(field => {
         const student = students.find(s => initialMarks.find(im => im.id === field.markId)?.studentId === s.id);
         return {
             ...field,
             studentName: student?.name || 'Unknown',
             admissionNumber: student?.admissionNumber || 'N/A'
         };
     });
  }, [fields, students, initialMarks]);

  async function onSubmit(values: FormData) {
    if (values.marks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Marks to Update',
        description: 'Please filter to a set of marks before saving.',
      });
      return;
    }
    setIsLoading(true);
    const result = await onUpdateMarks(values.marks);
    if (result.success) {
      toast({
        title: 'Update Successful',
        description: result.message || 'Marks have been updated.',
      });
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.message || 'An error occurred while updating marks.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filter by Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.stream}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="examId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filter by Exam</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an exam" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name} - {exam.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subjectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filter by Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead className="w-[120px]">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFiltering ? (
                 <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                 </TableRow>
              ) : fields.length > 0 ? (
                studentData.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.studentName}</TableCell>
                    <TableCell>{field.admissionNumber}</TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`marks.${index}.score`}
                        render={({ field: scoreField }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" {...scoreField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                    No marks found for these filters. Select a class, exam, and subject to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Button type="submit" disabled={isLoading || fields.length === 0}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  );
}
