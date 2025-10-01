
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
import { FileText, Banknote, Landmark, Scale, ArrowRight, Users, Book, List } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import type { Fee, Student, Payment, Class } from '@/lib/types';
import { PaymentsTable } from '@/components/dashboard/payments-table';
import { LogPaymentForm } from '@/components/dashboard/log-payment-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getData() {
    const feeDocs = await getDocs(collection(db, 'fees'));
    const fees = feeDocs.docs.map(doc => doc.data() as Fee);
    
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({...doc.data(), id: doc.id } as Student));

    const paymentDocs = await getDocs(collection(db, 'payments'));
    const payments = paymentDocs.docs.map(doc => doc.data() as Payment);

    const classDocs = await getDocs(collection(db, 'classes'));
    const classes = classDocs.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));

    return { fees, students, payments, classes };
}

export default async function AccountantPage() {
  const { fees, students, payments, classes } = await getData();

  const totalInvoiced = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const totalBalance = totalInvoiced - totalPaid;

  async function handleLogPayment(data: { studentId: string; amount: number; }) {
    'use server';
    
    const studentFees = (await getDocs(collection(db, 'fees')))
        .docs.map(doc => doc.data() as Fee)
        .filter(fee => fee.studentId === data.studentId);
    
    if (studentFees.length > 0) {
        const feeDocRef = doc(db, 'fees', studentFees[0].invoiceId);
        
        const batch = writeBatch(db);
        const feeData = studentFees[0];
        const newPaidAmount = feeData.paidAmount + data.amount;
        const newBalance = feeData.amount - newPaidAmount;
        const newStatus = newBalance <= 0 ? 'Paid' : 'Partial';

        batch.update(feeDocRef, {
            paidAmount: newPaidAmount,
            balance: newBalance,
            status: newStatus
        });

        // Log the payment transaction
        const paymentRef = doc(collection(db, 'payments'));
        batch.set(paymentRef, {
            paymentId: paymentRef.id,
            studentId: data.studentId,
            amount: data.amount,
            date: new Date().toISOString(),
            invoiceId: feeData.invoiceId
        });

        await batch.commit();
        
        return { success: true };
    }
    return { success: false, message: 'Could not find a fee record for the student.' };
  }

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Finance Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalInvoiced.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">KES {totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Log Payments</CardTitle>
                <CardDescription>Record new fee payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <LogPaymentForm students={students} onLogPayment={handleLogPayment} />
            </CardContent>
        </Card>
      </div>
      <div>
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Navigate to key financial sections.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-20 justify-between">
                <Link href="/accountant/students">
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-primary" />
                    <span className="font-semibold text-lg">Student Accounts</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 justify-between">
                <Link href="/accountant/payments">
                  <div className="flex items-center gap-4">
                    <Banknote className="h-8 w-8 text-primary" />
                    <span className="font-semibold text-lg">View Payments</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
               <Button asChild variant="outline" className="h-20 justify-between">
                <Link href="/classlist">
                  <div className="flex items-center gap-4">
                    <List className="h-8 w-8 text-primary" />
                    <span className="font-semibold text-lg">Print Class Lists</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
