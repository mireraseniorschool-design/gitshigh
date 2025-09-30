'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Download, Clipboard } from 'lucide-react';
import { generateStudentReports } from '@/ai/flows/generate-student-reports';
import { useToast } from '@/hooks/use-toast';
import { students, exams, marks, subjects } from '@/lib/data';

const formSchema = z.object({
  studentData: z.string().min(10, 'Student data is required.'),
  examData: z.string().min(10, 'Exam data is required.'),
  templateInstructions: z.string().min(10, 'Template instructions are required.'),
});

// Pre-populating with some data to make it easier for the user
const defaultStudentData = JSON.stringify(students.slice(0, 2), null, 2);
const defaultExamData = JSON.stringify({
  exams: exams.slice(0,1),
  marks: marks.filter(m => m.examId === 'exam-1' && (m.studentId === 'std-1' || m.studentId === 'std-2')),
  subjects: subjects,
}, null, 2);
const defaultTemplate = `Generate a report for each student. 
Include:
- Student Name and Admission Number.
- A table with subjects, scores, and a grade (A for >80, B for >60, C for >40, D for <40).
- Total marks and average score.
- A concluding remark on the student's performance.
- Format as Markdown.`;

export function AiReportGenerator() {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentData: defaultStudentData,
      examData: defaultExamData,
      templateInstructions: defaultTemplate,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateStudentReports(values);
      setReport(result.report);
      toast({
        title: 'Report Generated',
        description: 'The student report has been successfully generated.',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyToClipboard = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      toast({
        title: 'Copied to Clipboard',
        description: 'The report has been copied to your clipboard.',
      });
    }
  };

  const handleDownload = () => {
    if (report) {
      const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'student-report.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Report Generator
          </CardTitle>
          <CardDescription>
            Use AI to generate custom student reports from raw data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studentData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste student JSON data here"
                        className="h-32 font-code text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide student details like name, admission number, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="examData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam & Marks Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste exam and marks JSON data here"
                        className="h-32 font-code text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide exam details and student scores per subject.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="templateInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Generate a markdown report with a table...'"
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the desired format and content of the report.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Generated Report</CardTitle>
          <CardDescription>
            The generated markdown report will appear below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {isLoading && (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
              <div className="text-center text-muted-foreground">
                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                <p>Generating report...</p>
              </div>
            </div>
          )}
          {!isLoading && report && (
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-4 h-full overflow-y-auto">
              <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 font-body text-sm">{report}</pre>
            </div>
          )}
          {!isLoading && !report && (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
              <div className="text-center text-muted-foreground">
                <p>Your report will be displayed here.</p>
              </div>
            </div>
          )}
        </CardContent>
        {report && !isLoading && (
          <CardFooter className="gap-2">
            <Button variant="outline" onClick={handleCopyToClipboard}>
              <Clipboard className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
