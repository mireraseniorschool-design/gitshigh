'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import type { Student, Subject, Exam, Mark, Class } from '@/lib/types';
import { useRouter } from 'next/navigation';

const markSchema = z.object({
  studentId: z.string().min(1),
  score: z.coerce.number().min(0).max(100),
});

const formSchema = z.object({
  classId: z.string().min(1, 'Please select a class.'),
  examId: z.string().min(1, 'Please select an exam.'),
  subjectId: z.string().min(1, 'Please select a subject.'),
  marks: z.array(markSchema).min(1, 'Please add at least one student mark.'),
});

export function MarkEntryForm({
  students,
  subjects,
  exams,
  classes,
  onSaveMark,
}: {
  students: Student[];
  subjects: Subject[];
  exams: Exam[];
  classes: Class[];
  onSaveMark: (data: Omit<Mark, 'id'>) => Promise<{ success: boolean; message?: string }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: '',
      examId: '',
      subjectId: '',
      marks: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'marks',
  });

  const classId = form.watch('classId');

  const filteredStudents = useMemo(() => {
    return classId ? students.filter(s => s.classId === classId) : [];
  }, [classId, students]);

  useEffect(() => {
    replace(filteredStudents.map(s => ({ studentId: s.id, score: 0 })));
  }, [filteredStudents, replace]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    let allSuccess = true;
    let marksSavedCount = 0;

    for (const mark of values.marks) {
      if (mark.studentId && mark.score > 0) { // Only save marks that have been entered
        const result = await onSaveMark({
          examId: values.examId,
          subjectId: values.subjectId,
          studentId: mark.studentId,
          score: mark.score,
        });
        if (result.success) {
          marksSavedCount++;
        } else {
          allSuccess = false;
          toast({
            variant: 'destructive',
            title: 'Error Saving Mark',
            description: `Failed to save mark for a student. ${result.message || ''}`,
          });
        }
      }
    }

    if (allSuccess) {
      toast({
        title: 'Marks Saved',
        description: `${marksSavedCount} mark(s) have been successfully recorded.`,
      });
      router.refresh();
      // Reset scores but keep filters
      replace(filteredStudents.map(s => ({ studentId: s.id, score: 0 })));
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
                <FormLabel>Class</FormLabel>
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
                <FormLabel>Exam</FormLabel>
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
                <FormLabel>Subject</FormLabel>
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

        <div className="space-y-4 rounded-md border p-4">
          <FormLabel>Student Marks</FormLabel>
          {fields.length > 0 ? fields.map((field, index) => {
            const student = students.find(s => s.id === field.studentId);
            return (
                <div key={field.id} className="flex items-center gap-4">
                    <div className="flex-1 font-medium">{student?.name} ({student?.admissionNumber})</div>
                    <FormField
                        control={form.control}
                        name={`marks.${index}.score`}
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <Input type="number" placeholder="Score" className="w-24" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            )
           }) : (
            <p className="text-center text-muted-foreground pt-4">Select a class to load students.</p>
           )}
           <FormMessage>{form.formState.errors.marks?.message}</FormMessage>
        </div>

        <Button type="submit" disabled={isLoading || fields.length === 0}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Marks'
          )}
        </Button>
      </form>
    </Form>
  );
}
