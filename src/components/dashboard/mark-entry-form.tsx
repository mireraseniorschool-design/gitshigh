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
import { useState } from 'react';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import type { Student, Subject, Exam, Mark } from '@/lib/types';
import { useRouter } from 'next/navigation';

const markSchema = z.object({
  studentId: z.string().min(1),
  score: z.coerce.number().min(0).max(100),
});

const formSchema = z.object({
  examId: z.string().min(1, 'Please select an exam.'),
  subjectId: z.string().min(1, 'Please select a subject.'),
  marks: z.array(markSchema),
});

export function MarkEntryForm({
  students,
  subjects,
  exams,
  onSaveMark,
}: {
  students: Student[];
  subjects: Subject[];
  exams: Exam[];
  onSaveMark: (data: Omit<Mark, 'id'>) => Promise<{ success: boolean; message?: string }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examId: '',
      subjectId: '',
      marks: [{ studentId: '', score: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'marks',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    let allSuccess = true;

    for (const mark of values.marks) {
      if (mark.studentId) {
        const result = await onSaveMark({
          examId: values.examId,
          subjectId: values.subjectId,
          studentId: mark.studentId,
          score: mark.score,
        });
        if (!result.success) {
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
        description: 'All marks have been successfully recorded.',
      });
      form.reset({
        examId: values.examId,
        subjectId: values.subjectId,
        marks: [{ studentId: '', score: 0 }],
      });
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-4">
          <FormLabel>Student Marks</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-4">
              <FormField
                control={form.control}
                name={`marks.${index}.studentId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
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
                name={`marks.${index}.score`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" placeholder="Score" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ studentId: '', score: 0 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        <Button type="submit" disabled={isLoading}>
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
