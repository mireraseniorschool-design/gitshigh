'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Student, Class, Exam, Mark, Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  reportType: z.enum(['marksheet', 'class_performance', 'class_marksheet', 'form_marksheet']),
  examId: z.string().min(1, 'Please select an exam.'),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  subjectId: z.string().optional(),
  formName: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
}

type ReportData = {
    title: string;
    headers: string[];
    rows: (string | number)[][];
    meta: Record<string, string>;
    rawValues: FormData;
    analysis?: {
        gradeDistribution: Record<string, number>;
        meanGrade: string;
        entryCount: number;
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
  const [reportData, setReportData] = useState<ReportData | null>(null);
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

  const getGrade = (score: number) => {
    if (score >= 80) return 'A';
    if (score >= 75) return 'A-';
    if (score >= 70) return 'B+';
    if (score >= 65) return 'B';
    if (score >= 60) return 'B-';
    if (score >= 55) return 'C+';
    if (score >= 50) return 'C';
    if (score >= 45) return 'C-';
    if (score >= 40) return 'D+';
    if (score >= 35) return 'D';
    if (score >= 30) return 'D-';
    return 'E';
  };

  const previewMarksheet = (values: FormData) => {
    if (!values.studentId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a student for the marksheet.' });
        return;
    }
    const student = students.find(s => s.id === values.studentId);
    const exam = exams.find(e => e.id === values.examId);
    if (!student || !exam) return;

    const studentMarks = marks.filter(m => m.studentId === values.studentId && m.examId === values.examId);
    
    const headers = ['Subject', 'Score', 'Grade'];
    const rows = studentMarks.map(mark => [
      getSubjectName(mark.subjectId),
      mark.score,
      getGrade(mark.score)
    ]);
    
    const totalMarks = studentMarks.reduce((sum, mark) => sum + mark.score, 0);
    const average = studentMarks.length > 0 ? totalMarks / studentMarks.length : 0;
    
    rows.push(['Total Marks', totalMarks.toString(), '']);
    rows.push(['Average Score', average.toFixed(2), getGrade(average)]);

    setReportData({
        title: 'Student Marksheet',
        headers,
        rows,
        meta: {
            'Student': `${student.name} (${student.admissionNumber})`,
            'Exam': `${exam.name} - ${exam.year}`,
            'Class': getClassName(student.classId),
        },
        rawValues: values,
    });
  };

  const previewClassPerformance = (values: FormData) => {
     if (!values.classId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a class.' });
        return;
    }
    const cls = classes.find(c => c.id === values.classId);
    const exam = exams.find(e => e.id === values.examId);
    if (!cls || !exam) return;

    const classStudents = students.filter(s => s.classId === values.classId);

    const studentData = classStudents.map(student => {
        const studentMarks = marks.filter(m => m.studentId === student.id && m.examId === values.examId);
        const totalMarks = studentMarks.reduce((sum, mark) => sum + mark.score, 0);
        const average = studentMarks.length > 0 ? (totalMarks / studentMarks.length) : 0;
        return {
            admissionNumber: student.admissionNumber,
            name: student.name,
            totalMarks,
            average,
        };
    }).sort((a,b) => b.totalMarks - a.totalMarks);

    const headers = ['Rank', 'Adm No', 'Student Name', 'Total Marks', 'Average (%)', 'Grade'];
    const rows = studentData.map((data, index) => [
        index + 1,
        data.admissionNumber,
        data.name,
        data.totalMarks.toFixed(0),
        data.average.toFixed(2),
        getGrade(data.average)
    ]);

     setReportData({
        title: 'Class Performance Report',
        headers,
        rows,
        meta: {
            'Class': `${cls.name} ${cls.stream || ''}`,
            'Exam': `${exam.name} - ${exam.year}`,
        },
        rawValues: values,
    });
  }

  const generateDetailedMarksheet = (studentList: Student[], title: string, meta: Record<string, string>, values: FormData) => {
    const exam = exams.find(e => e.id === values.examId);
    if (!exam) return;

    const examSubjects = [...new Set(marks.filter(m => m.examId === values.examId).map(m => m.subjectId))]
        .map(id => subjects.find(s => s.id === id)!)
        .filter(Boolean)
        .sort((a, b) => parseInt(a.code) - parseInt(b.code));
    
    const headers = ['Rank', 'Adm No', 'Name', ...examSubjects.map(s => s.name.substring(0,3).toUpperCase()), 'Total', 'Avg', 'Grade'];
    
    const studentPerformance = studentList.map(student => {
        const studentMarks = marks.filter(m => m.studentId === student.id && m.examId === values.examId);
        const totalMarks = studentMarks.reduce((sum, mark) => sum + mark.score, 0);
        const average = studentMarks.length > 0 ? totalMarks / studentMarks.length : 0;
        const grade = getGrade(average);
        
        const subjectScores = examSubjects.map(subj => {
            const mark = studentMarks.find(m => m.subjectId === subj.id);
            return mark ? `${mark.score} ${getGrade(mark.score)}` : '-';
        });

        return {
            admissionNumber: student.admissionNumber,
            name: student.name,
            subjectScores,
            totalMarks,
            average,
            grade
        };
    }).sort((a, b) => b.totalMarks - a.totalMarks);

    const rows = studentPerformance.map((perf, index) => [
        index + 1,
        perf.admissionNumber,
        perf.name,
        ...perf.subjectScores,
        perf.totalMarks,
        perf.average.toFixed(2),
        perf.grade
    ]);

    const allGrades = ['A','A-','B+','B','B-','C+','C','C-','D+','D','D-','E'];
    const gradeDistribution = allGrades.reduce((acc, grade) => ({...acc, [grade]: 0}), {} as Record<string, number>);
    
    studentPerformance.forEach(perf => {
        if(gradeDistribution[perf.grade] !== undefined) {
           gradeDistribution[perf.grade]++;
        }
    });

    const totalAverage = studentPerformance.reduce((sum, p) => sum + p.average, 0) / (studentPerformance.length || 1);

    setReportData({
        title,
        headers,
        rows,
        meta,
        rawValues: values,
        analysis: {
            gradeDistribution,
            meanGrade: getGrade(totalAverage),
            entryCount: studentPerformance.length
        }
    });
  }

  const previewClassMarksheet = (values: FormData) => {
    if (!values.classId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a class.' });
        return;
    }
    const cls = classes.find(c => c.id === values.classId);
    const exam = exams.find(e => e.id === values.examId);
    if (!cls || !exam) return;

    const classStudents = students.filter(s => s.classId === values.classId);
    
    generateDetailedMarksheet(
        classStudents,
        'Class Marksheet',
        {
            'Class': `${cls.name} ${cls.stream || ''}`,
            'Exam': `${exam.name} - ${exam.year}`,
        },
        values
    );
  };
  
  const previewFormMarksheet = (values: FormData) => {
    if (!values.formName) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a form.' });
        return;
    }
    const exam = exams.find(e => e.id === values.examId);
    if (!exam) return;

    const formClasses = classes.filter(c => c.name === values.formName);
    const formStudentIds = students.filter(s => formClasses.some(fc => fc.id === s.classId)).map(s => s.id);
    const formStudents = students.filter(s => formStudentIds.includes(s.id));

     generateDetailedMarksheet(
        formStudents,
        'Form Marksheet',
        {
            'Form': values.formName,
            'Exam': `${exam.name} - ${exam.year}`,
        },
        values
    );

  }


  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setReportData(null);
    try {
        switch (values.reportType) {
            case 'marksheet':
                previewMarksheet(values);
                break;
            case 'class_performance':
                previewClassPerformance(values);
                break;
            case 'class_marksheet':
                previewClassMarksheet(values);
                break;
            case 'form_marksheet':
                previewFormMarksheet(values);
                break;
        }
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate the report preview.' });
    }
    setIsLoading(false);
  }

  const handleDownloadPdf = () => {
    if (!reportData) return;
    const { title, meta, headers, rows, rawValues, analysis } = reportData;
    const doc = new jsPDF({ orientation: headers.length > 7 ? 'landscape' : 'portrait' });
    
    doc.setFontSize(16);
    doc.text("GITS HIGH", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

    const metaYStart = 32;
    Object.entries(meta).forEach(([key, value], index) => {
      doc.text(`${key}: ${value}`, 14, metaYStart + (index * 8));
    });

    const tableStartY = metaYStart + (Object.keys(meta).length * 8) + 5;

    doc.autoTable({
      startY: tableStartY,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 7, fontStyle: 'bold' },
      styles: { fontSize: 7, cellPadding: 1 },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.text('Page ' + doc.internal.pages.currentPage.pageNumber, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
      }
    });

    if (analysis) {
        let finalY = (doc as any).lastAutoTable.finalY || tableStartY + 20;
        doc.addPage();
        doc.setFontSize(12);
        doc.text("Performance Analysis", 14, 20);
        
        const gradeEntries = Object.entries(analysis.gradeDistribution);
        const analysisHeaders = ['Grade', 'Count'];
        const analysisBody = gradeEntries.map(([grade, count]) => [grade, count]);
        
        analysisBody.push(['', '']);
        analysisBody.push(['Mean Grade', analysis.meanGrade]);
        analysisBody.push(['Total Students', analysis.entryCount]);
        
        doc.autoTable({
            startY: 25,
            head: [analysisHeaders],
            body: analysisBody,
            theme: 'grid'
        });
    }
    
    const student = rawValues.studentId ? students.find(s => s.id === rawValues.studentId) : null;
    const cls = rawValues.classId ? classes.find(c => c.id === rawValues.classId) : null;
    const exam = exams.find(e => e.id === rawValues.examId);
    let fileName = `${title.replace(/\s/g, '-')}.pdf`;
    if (rawValues.reportType === 'marksheet' && student && exam) {
        fileName = `Marksheet-${student.admissionNumber}-${exam.name}.pdf`;
    } else if ( (rawValues.reportType === 'class_marksheet' || rawValues.reportType === 'class_performance') && cls && exam) {
        fileName = `Report-${cls.name.replace(/\s/g, '_')}-${exam.name.replace(/\s/g, '_')}.pdf`;
    } else if (rawValues.reportType === 'form_marksheet' && rawValues.formName && exam) {
        fileName = `Report-${rawValues.formName.replace(/\s/g, '_')}-${exam.name.replace(/\s/g, '_')}.pdf`;
    }


    doc.save(fileName);
    toast({ title: 'Report Downloaded', description: 'Your PDF has been saved.' });
  };
  
  useEffect(() => {
    setReportData(null);
    form.reset({
        ...form.getValues(),
        classId: '',
        studentId: '',
        formName: '',
    });
  }, [reportType, form]);

  const formNames = [...new Set(classes.map(c => c.name))].sort();


  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Generate Reports</CardTitle>
        <CardDescription>Select report criteria and generate a preview.</CardDescription>
      </CardHeader>
      <CardContent>
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
                        <SelectItem value="class_marksheet">Class Marksheet</SelectItem>
                        <SelectItem value="form_marksheet">Form Marksheet</SelectItem>
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
                        <FormLabel>Class (Optional)</FormLabel>
                        <Select onValueChange={(val) => { field.onChange(val); form.setValue('studentId', ''); }} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Filter by class" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.name} {c.stream || ''}</SelectItem>
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
                                {students.filter(s => !selectedClassId || selectedClassId === 'all' || s.classId === selectedClassId).map((student) => (
                                    <SelectItem key={student.id} value={student.id}>{student.name} ({student.admissionNumber})</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
            )}

            {(reportType === 'class_performance' || reportType === 'class_marksheet') && (
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
                            <SelectItem key={c.id} value={c.id}>{c.name} {c.stream}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
             {reportType === 'form_marksheet' && (
                <FormField
                control={form.control}
                name="formName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Form</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a form" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {formNames.map((name) => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
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
                <><Eye className="mr-2 h-4 w-4" /> Preview Report</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>

    {reportData && (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>{reportData.title}</CardTitle>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {Object.entries(reportData.meta).map(([key, value]) => (
                            <span key={key} className="text-sm text-muted-foreground"><b>{key}:</b> {value}</span>
                        ))}
                    </div>
                </div>
                <Button onClick={handleDownloadPdf} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table className="text-xs">
                        <TableHeader>
                            <TableRow>
                                {reportData.headers.map(header => <TableHead key={header} className="px-2 py-2">{header}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.rows.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell key={cellIndex} className={`px-2 py-1 ${cellIndex === 2 ? 'whitespace-nowrap' : ''} ${cellIndex === 0 ? 'font-bold' : ''}`}>{cell}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {reportData.analysis && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Analysis Summary</h3>
                        <div className="border rounded-lg p-4 max-w-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {Object.keys(reportData.analysis.gradeDistribution).map(grade => <TableHead key={grade}>{grade}</TableHead>)}
                                        <TableHead>ENTRY</TableHead>
                                        <TableHead>MEAN GRADE</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        {Object.values(reportData.analysis.gradeDistribution).map((count, i) => <TableCell key={i}>{count}</TableCell>)}
                                        <TableCell>{reportData.analysis.entryCount}</TableCell>
                                        <TableCell>{reportData.analysis.meanGrade}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )}
    </div>
  );
}
