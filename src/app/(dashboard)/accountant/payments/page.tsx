import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Payment, Student } from '@/lib/types';
import { PaymentsTable } from '@/components/dashboard/payments-table';

async function getData() {
    const paymentDocs = await getDocs(collection(db, 'payments'));
    const payments = paymentDocs.docs.map(doc => doc.data() as Payment);

    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    return { payments, students };
}

export default async function AccountantPaymentsPage() {
  const { payments, students } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Payment History</h1>
      <Card>
          <CardHeader>
              <CardTitle>All Payments</CardTitle>
              <CardDescription>View a log of all payments received from students.</CardDescription>
          </CardHeader>
          <CardContent>
              <PaymentsTable payments={payments} students={students} />
          </CardContent>
      </Card>
    </div>
  );
}
