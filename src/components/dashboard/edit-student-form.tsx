'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import type { Student, Class, Subject } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  classId: z.string().min(1, 'Please select a class.'),
  subjectIds: z.array(z.string()).min(1, 'Please select at least one subject.'),
});

export function EditStudentForm({
  student,
  classes,
  subjects,
  studentSubjects,
  onUpdate,
}: {
  student: Student;
  classes: Class[];
  subjects: Subject[];
  studentSubjects: string[];
  onUpdate: (data: z.infer<typeof formSchema>) => Promise<{ success: boolean; message?: string }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.includes('/admin/') ? '/admin' : '/dean';


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student.name,
      classId: student.classId,
      subjectIds: studentSubjects,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await onUpdate(values);
    if (result.success) {
      toast({
        title: 'Student Updated',
        description: result.message || 'The student record has been successfully updated.',
      });
      router.refresh();
      router.push(`${basePath}/students`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.message || 'An error occurred while updating the student.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="Enter student's full name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
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
        
        <Separator />

        <FormField
          control={form.control}
          name="subjectIds"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Subject Registration</FormLabel>
                <FormDescription>
                  Select the subjects this student is enrolled in.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <FormField
                    key={subject.id}
                    control={form.control}
                    name="subjectIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={subject.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(subject.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, subject.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== subject.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {subject.name}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  );
}
