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
import { useRouter, usePathname } from 'next/navigation';
import type { Class } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  admissionNumber: z.string().min(1, 'Admission number is required.'),
  dateOfBirth: z.date({ required_error: "A date of birth is required." }),
  classId: z.string().min(1, 'Please select a class.'),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type ServerActionData = {
    name: string;
    admissionNumber: string;
    dateOfBirth: string;
    classId: string;
    guardianName?: string;
    guardianPhone?: string;
}

export function AddStudentForm({
  classes,
  onAddStudent,
}: {
  classes: Class[];
  onAddStudent: (data: ServerActionData) => Promise<{ success: boolean; message?: string }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.includes('/admin/') ? '/admin' : '/dean';


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      admissionNumber: '',
      classId: '',
      guardianName: '',
      guardianPhone: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);

    const payload = {
        ...values,
        dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
    };
    
    const result = await onAddStudent(payload);
    
    if (result.success) {
      toast({
        title: 'Student Added',
        description: result.message || 'The new student has been successfully enrolled.',
      });
      router.refresh();
      router.push(`${basePath}/students`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Enrollment Failed',
        description: result.message || 'An error occurred while adding the student.',
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
                    <Input placeholder="Enter student's full name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="admissionNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Admission Number</FormLabel>
                <FormControl>
                    <Input placeholder="Enter admission number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date > new Date() || date < new Date("1990-01-01")
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Assign to Class</FormLabel>
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
            name="guardianName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Guardian Name (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="Enter guardian's name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="guardianPhone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Guardian Phone (Optional)</FormLabel>
                <FormControl>
                    <Input placeholder="Enter guardian's phone number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Button type="submit" disabled={isLoading} className="mt-6">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enrolling Student...
            </>
          ) : (
            'Add Student'
          )}
        </Button>
      </form>
    </Form>
  );
}
