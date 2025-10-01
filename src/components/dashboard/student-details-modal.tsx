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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Student, Class, Subject } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  classId: z.string().min(1, 'Please select a class.'),
  subjectIds: z.array(z.string()).min(1, 'Please select at least one subject.'),
  dateOfBirth: z.date({ required_error: "A date of birth is required." }),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
});

type ServerActionData = Omit<z.infer<typeof formSchema>, 'dateOfBirth'> & { dateOfBirth: string };

export function StudentDetailsModal({
  student,
  classes,
  subjects,
  studentSubjects,
  onUpdate,
  isOpen,
  onClose,
}: {
  student: Student;
  classes: Class[];
  subjects: Subject[];
  studentSubjects: string[];
  onUpdate: (data: ServerActionData) => Promise<{ success: boolean; message?: string }>;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student.name,
      classId: student.classId,
      subjectIds: studentSubjects,
      dateOfBirth: new Date(student.dateOfBirth),
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
     const payload: ServerActionData = {
        ...values,
        dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
    };
    const result = await onUpdate(payload);
    if (result.success) {
      toast({
        title: 'Student Updated',
        description: result.message || 'The student record has been successfully updated.',
      });
      router.refresh();
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Edit Student: {student.name}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="personal">
                <TabsList className='mb-4'>
                    <TabsTrigger value="personal">Personal Details</TabsTrigger>
                    <TabsTrigger value="academic">Academic Details</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            name="dateOfBirth"
                            render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
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
                                        disabled={(date) => date > new Date() || date < new Date("1990-01-01")}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                        )}
                        />
                        <div className="md:col-span-2 lg:col-span-3">
                            <Separator />
                            <h3 className='text-lg font-medium my-4'>Family Background</h3>
                        </div>
                        <FormField
                            control={form.control}
                            name="guardianName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Guardian Name</FormLabel>
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
                                <FormLabel>Guardian Phone</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter guardian's phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-6">
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
                        render={() => (
                            <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Subject Registration</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                Select the subjects this student is enrolled in.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </TabsContent>
            </Tabs>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </DialogFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
