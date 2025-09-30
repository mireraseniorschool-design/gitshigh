'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Mark, Subject, Student } from '@/lib/types';

interface ChartData {
  subject: string;
  averageScore: number;
}

export function AcademicAnalysisClient({ marks, subjects, students }: { marks: Mark[], subjects: Subject[], students: Student[] }) {
  
  const subjectAverages = subjects.map(subject => {
    const subjectMarks = marks.filter(mark => mark.subjectId === subject.id);
    const totalScore = subjectMarks.reduce((acc, mark) => acc + mark.score, 0);
    const averageScore = subjectMarks.length > 0 ? totalScore / subjectMarks.length : 0;
    return {
      subject: subject.name,
      averageScore: parseFloat(averageScore.toFixed(2)),
    };
  });

  return (
    <div className="w-full h-[400px]">
        <h3 className="text-lg font-semibold mb-4">Average Subject Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageScore" fill="hsl(var(--primary))" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
