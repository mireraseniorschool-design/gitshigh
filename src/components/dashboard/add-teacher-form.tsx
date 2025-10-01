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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Subject } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  staffId: z.string().min(1, 'Staff ID is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().optional(),
  subjectIds: z.array(z.string()).min(1, 'Please select at least one subject.'),
});

type FormData = z.infer<typeof formSchema>;

export function AddTeacherForm({
  subjects,
  onAddTeacher,
}: {
  subjects: Subject[];
  onAddTeacher: (data: FormData) => Promise<{ success: boolean; message?: string }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      staffId: '',
      email: '',
      phone: '',
      subjectIds: [],
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    
    const result = await onAddTeacher(values);
    
    if (result.success) {
      toast({
        title: 'Teacher Added',
        description: result.message || 'The new teacher has been successfully added.',
      });
      router.refresh();
      router.push('/admin');
    } else {
      toast({
        variant: 'destructive',
        title: 'Enrollment Failed',
        description: result.message || 'An error occurred while adding the teacher.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="Enter teacher's full name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="staffId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Staff ID</FormLabel>
                <FormControl>
                    <Input placeholder="Enter staff ID" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <Separator />

        <FormField
          control={form.control}
          name="subjectIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Assigned Subjects</FormLabel>
                <FormDescription>
                  Select the subjects this teacher will be responsible for.
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


        <Button type="submit" disabled={isLoading} className="mt-6">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Teacher...
            </>
          ) : (
            'Add Teacher'
          )}
        </Button>
      </form>
    </Form>
  );
}
