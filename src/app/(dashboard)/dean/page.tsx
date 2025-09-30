import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Presentation, GraduationCap } from 'lucide-react';
import { AiReportGenerator } from '@/components/dashboard/ai-report-generator';

// Dummy components for content
const ExamManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>Exams & Marks</CardTitle>
      <CardDescription>Create exams and manage student marks.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Exam and marks entry interface will be here.</p>
    </CardContent>
  </Card>
);

const AcademicAnalysis = () => (
  <Card>
    <CardHeader>
      <CardTitle>Academic Analysis</CardTitle>
      <CardDescription>View performance charts for classes and subjects.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Charts and graphs for academic analysis will be here.</p>
    </CardContent>
  </Card>
);

export default function DeanPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Dean's Dashboard</h1>
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">AI Report Generator</TabsTrigger>
          <TabsTrigger value="exams">Exams & Marks</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="reports" className="mt-4">
          <AiReportGenerator />
        </TabsContent>
        <TabsContent value="exams" className="mt-4">
          <ExamManagement />
        </TabsContent>
        <TabsContent value="analysis" className="mt-4">
          <AcademicAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
