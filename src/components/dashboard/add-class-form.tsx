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
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Teacher } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Class name is required.'),
  stream: z.string().optional(),
  classTeacherId: z.string().min(1, 'Please assign a class teacher.'),
});

type FormData = z.infer<typeof formSchema>;

export function AddClassForm({
  teachers,
  onAddClass,
}: {
  teachers: Teacher[];
  onAddClass: (data: FormData) => Promise<{ success: boolean; message?: string }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      stream: '',
      classTeacherId: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    
    const result = await onAddClass(values);
    
    if (result.success) {
      toast({
        title: 'Class Added',
        description: result.message || 'The new class has been successfully created.',
      });
      router.refresh();
      router.push('/admin');
    } else {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: result.message || 'An error occurred while adding the class.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Form 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stream"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stream (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., A, Blue, North" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="classTeacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Class Teacher</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="mt-6">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Class...
            </>
          ) : (
            'Add Class'
          )}
        </Button>
      </form>
    </Form>
  );
}
