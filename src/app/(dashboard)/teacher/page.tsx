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
import { ClipboardCheck, PenSquare, Bot } from 'lucide-react';
import { AiReportGenerator } from '@/components/dashboard/ai-report-generator';

const AttendanceManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>Mark Attendance</CardTitle>
      <CardDescription>Mark daily attendance for your classes.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Attendance marking interface will be here.</p>
    </CardContent>
  </Card>
);

const MarkEntry = () => (
  <Card>
    <CardHeader>
      <CardTitle>Enter Marks</CardTitle>
      <CardDescription>Input student marks for exams.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Marks entry form will be here.</p>
    </CardContent>
  </Card>
);


export default function TeacherPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Teacher's Dashboard</h1>
       <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance"><ClipboardCheck className="mr-2 h-4 w-4" />Attendance</TabsTrigger>
          <TabsTrigger value="marks"><PenSquare className="mr-2 h-4 w-4" />Enter Marks</TabsTrigger>
          <TabsTrigger value="reports"><Bot className="mr-2 h-4 w-4" />AI Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="mt-4">
            <AttendanceManagement />
        </TabsContent>
        <TabsContent value="marks" className="mt-4">
            <MarkEntry />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
            <AiReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
