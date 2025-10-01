'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Student, Attendance, Class } from '@/lib/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const attendanceSchema = z.object({
  studentId: z.string(),
  status: z.enum(['Present', 'Absent', 'Late']),
});

const formSchema = z.object({
  date: z.date(),
  attendance: z.array(attendanceSchema),
});

type FormData = z.infer<typeof formSchema>;

export function AttendanceManager({
  students,
  attendance,
  classes,
  onSaveAttendance,
}: {
  students: Student[];
  attendance: Attendance[];
  classes: Class[];
  onSaveAttendance: (data: { studentId: string, status: 'Present' | 'Absent' | 'Late', date: string }[]) => Promise<{ success: boolean; message?: string }>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(0), 
      attendance: [],
    },
  });

  const filteredStudents = selectedClassId ? students.filter(s => s.classId === selectedClassId) : [];

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    form.setValue('date', today);
    handleDateChange(today);
  }, []);

  useEffect(() => {
    handleDateChange(form.getValues('date'));
  }, [selectedClassId]);

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    form.setValue('date', date);
    const dateString = format(date, 'yyyy-MM-dd');
    const newAttendance = filteredStudents.map(student => {
      const recordedAttendance = attendance.find(a => a.studentId === student.id && a.date === dateString);
      return { studentId: student.id, status: recordedAttendance?.status || 'Present' };
    });
    form.setValue('attendance', newAttendance);
  };

  async function onSubmit(values: FormData) {
    if (filteredStudents.length === 0) {
        toast({ variant: 'destructive', title: 'No students to save', description: 'Please select a class with students.'});
        return;
    }
    setIsLoading(true);
    const dateString = format(values.date, 'yyyy-MM-dd');
    const payload = values.attendance.map(att => ({
        ...att,
        date: dateString
    }));

    const result = await onSaveAttendance(payload);

    if (result.success) {
      toast({
        title: 'Attendance Saved',
        description: `Attendance for ${format(values.date, 'PPP')} has been saved.`,
      });
      router.refresh();
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message || 'Failed to save attendance.'
        });
    }
    setIsLoading(false);
  }
  
  if (!isClient) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-10 w-[280px] bg-muted rounded-md animate-pulse"></div>
            </div>
            <div className="space-y-4 rounded-md border p-4">
                <p className="text-muted-foreground">Loading attendance...</p>
            </div>
        </div>
    );
  }

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
            <Label>Class</Label>
            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.stream}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Label>Attendance Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4 rounded-md border p-4 min-h-[10rem]">
        {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
            <div key={student.id} className="flex items-center justify-between">
                <Label>{student.name}</Label>
                <FormField
                control={form.control}
                name={`attendance.${index}.status`}
                render={({ field }) => (
                    <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-4"
                    >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Present" id={`present-${student.id}`} />
                        <Label htmlFor={`present-${student.id}`}>Present</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Absent" id={`absent-${student.id}`} />
                        <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Late" id={`late-${student.id}`} />
                        <Label htmlFor={`late-${student.id}`}>Late</Label>
                    </div>
                    </RadioGroup>
                )}
                />
            </div>
            ))
        ) : (
            <p className="text-center text-muted-foreground pt-8">Please select a class to view students.</p>
        )}
      </div>
      
      <Button type="submit" disabled={isLoading || filteredStudents.length === 0}>
        {isLoading ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
            </>
        ) : 'Save Attendance'}
      </Button>
    </form>
    </Form>
  );
}
