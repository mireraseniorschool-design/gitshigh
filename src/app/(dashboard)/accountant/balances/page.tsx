import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Fee, Student, Class } from '@/lib/types';
import { FeeBalancesTable } from '@/components/dashboard/fee-balances-table';

async function getData() {
    const feeDocs = await getDocs(collection(db, 'fees'));
    const fees = feeDocs.docs.map(doc => doc.data() as Fee);
    
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));

    return { fees, students, classes };
}

export default async function AccountantBalancesPage() {
  const { fees, students, classes } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Student Fee Balances</h1>
      <Card>
          <CardHeader>
              <CardTitle>Outstanding Balances</CardTitle>
              <CardDescription>A summary of outstanding fee balances per student.</CardDescription>
          </CardHeader>
          <CardContent>
              <FeeBalancesTable fees={fees} students={students} classes={classes} />
          </CardContent>
      </Card>
    </div>
  );
}
