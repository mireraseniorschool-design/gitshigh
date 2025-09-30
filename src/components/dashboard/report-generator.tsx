'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Student, Class, Exam, Mark, Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  reportType: z.enum(['marksheet', 'class_performance', 'subject_analysis']),
  examId: z.string().min(1, 'Please select an exam.'),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  subjectId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
}

export function ReportGenerator({
  students,
  classes,
  exams,
  marks,
  subjects,
}: {
  students: Student[];
  classes: Class[];
  exams: Exam[];
  marks: Mark[];
  subjects: Subject[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: 'marksheet',
      examId: '',
    },
  });

  const reportType = form.watch('reportType');
  const selectedClassId = form.watch('classId');

  const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'N/A';
  const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || 'N/A';
  const getClassName = (classId: string) => classes.find(c => c.id === classId)?.name || 'N/A';
  const getExamName = (examId: string) => exams.find(e => e.id === examId)?.name || 'N/A';

  const generateMarksheet = (values: FormData) => {
    if (!values.studentId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a student for the marksheet.' });
        return;
    }
    const doc = new jsPDF();
    const student = students.find(s => s.id === values.studentId);
    const exam = exams.find(e => e.id === values.examId);
    if (!student || !exam) return;

    const studentMarks = marks.filter(m => m.studentId === values.studentId && m.examId === values.examId);
    
    doc.setFontSize(18);
    doc.text('Student Marksheet', 14, 22);
    doc.setFontSize(12);
    doc.text(`Student: ${student.name} (${student.admissionNumber})`, 14, 32);
    doc.text(`Exam: ${exam.name} - ${exam.year}`, 14, 40);
    doc.text(`Class: ${getClassName(student.classId)}`, 14, 48);

    const tableData = studentMarks.map(mark => [
      getSubjectName(mark.subjectId),
      mark.score,
      mark.score >= 80 ? 'A' : mark.score >= 60 ? 'B' : mark.score >= 40 ? 'C' : 'D'
    ]);
    
    const totalMarks = studentMarks.reduce((sum, mark) => sum + mark.score, 0);
    const average = studentMarks.length > 0 ? totalMarks / studentMarks.length : 0;
    
    tableData.push(['', '', '']); // spacer
    tableData.push(['Total Marks', totalMarks.toString(), '']);
    tableData.push(['Average Score', average.toFixed(2), '']);

    doc.autoTable({
      startY: 55,
      head: [['Subject', 'Score', 'Grade']],
      body: tableData,
    });

    doc.save(`Marksheet-${student.admissionNumber}-${exam.name}.pdf`);
  };

  const generateClassPerformance = (values: FormData) => {
     if (!values.classId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a class.' });
        return;
    }
    const doc = new jsPDF();
    const cls = classes.find(c => c.id === values.classId);
    const exam = exams.find(e => e.id === values.examId);
    if (!cls || !exam) return;

    doc.setFontSize(18);
    doc.text(`Class Performance Report`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Class: ${cls.name} ${cls.stream || ''}`, 14, 32);
    doc.text(`Exam: ${exam.name} - ${exam.year}`, 14, 40);

    const classStudents = students.filter(s => s.classId === values.classId);
    const tableData = classStudents.map(student => {
        const studentMarks = marks.filter(m => m.studentId === student.id && m.examId === values.examId);
        const totalMarks = studentMarks.reduce((sum, mark) => sum + mark.score, 0);
        const average = studentMarks.length > 0 ? (totalMarks / studentMarks.length) : 0;
        return [
            student.admissionNumber,
            student.name,
            totalMarks.toFixed(0),
            average.toFixed(2),
        ];
    }).sort((a,b) => parseFloat(b[3]) - parseFloat(a[3])); // Sort by average descending

    doc.autoTable({
      startY: 50,
      head: [['Adm No', 'Student Name', 'Total Marks', 'Average (%)']],
      body: tableData,
    });

    doc.save(`ClassPerformance-${cls.name}-${exam.name}.pdf`);
  }

  const generateSubjectAnalysis = (values: FormData) => {
    // This is a placeholder for a more detailed analysis
    toast({ title: 'Info', description: 'Subject Analysis report is not yet implemented.' });
  }

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
        switch (values.reportType) {
            case 'marksheet':
                generateMarksheet(values);
                break;
            case 'class_performance':
                generateClassPerformance(values);
                break;
            case 'subject_analysis':
                generateSubjectAnalysis(values);
                break;
        }
        toast({ title: 'Report Generated', description: 'Your PDF has been downloaded.' });
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate the report.' });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="reportType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Report Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a report type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="marksheet">Student Marksheet</SelectItem>
                    <SelectItem value="class_performance">Class Performance</SelectItem>
                    <SelectItem value="subject_analysis">Subject Analysis</SelectItem>
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
                    <SelectTrigger><SelectValue placeholder="Select an exam" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>{exam.name} - {exam.year}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {reportType === 'marksheet' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Filter by class" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {students.filter(s => !selectedClassId || s.classId === selectedClassId).map((student) => (
                                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
        )}

        {reportType === 'class_performance' && (
            <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
          ) : (
            <><Download className="mr-2 h-4 w-4" /> Download PDF</>
          )}
        </Button>
      </form>
    </Form>
  );
}
