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
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Student, Exam, Mark, Subject, Class } from '@/lib/types';
import { ExamsAndMarks } from '@/components/dashboard/exams-and-marks';
import { AcademicAnalysisClient } from '@/components/dashboard/academic-analysis-client';
import { ReportGenerator } from '@/components/dashboard/report-generator';

async function getData() {
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const examDocs = await getDocs(collection(db, 'exams'));
    const exams = examDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Exam));
    
    const marksQuery = await getDocs(collection(db, 'marks'));
    const marks = marksQuery.docs.map(doc => doc.data() as Mark);

    const subjectDocs = await getDocs(collection(db, 'subjects'));
    const subjects = subjectDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Subject));

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Class));

    return { students, exams, marks, subjects, classes };
}

export default async function DeanPage() {
  const { students, exams, marks, subjects, classes } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Dean's Dashboard</h1>
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Generate Reports</TabsTrigger>
          <TabsTrigger value="exams">Exams & Marks</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="reports" className="mt-4">
            <ReportGenerator 
            students={students} 
            classes={classes}
            exams={exams}
            marks={marks}
            subjects={subjects}
            />
        </TabsContent>
        <TabsContent value="exams" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Exams & Marks</CardTitle>
              <CardDescription>View exams and student marks.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExamsAndMarks exams={exams} marks={marks} students={students} subjects={subjects} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analysis" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Analysis</CardTitle>
              <CardDescription>View performance charts for classes and subjects.</CardDescription>
            </CardHeader>
            <CardContent>
                <AcademicAnalysisClient marks={marks} subjects={subjects} students={students} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
