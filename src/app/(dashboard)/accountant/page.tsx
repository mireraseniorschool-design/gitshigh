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
import { FileText, Banknote } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import type { Fee } from '@/lib/types';
import { FeeInvoicesTable } from '@/components/dashboard/fee-invoices-table';
import { LogPaymentForm } from '@/components/dashboard/log-payment-form';
import { students } from '@/lib/data';

async function getData() {
    const feeDocs = await getDocs(collection(db, 'fees'));
    const fees = feeDocs.docs.map(doc => doc.data() as Fee);
    
    const studentDocs = await getDocs(collection(db, 'students'));
    const students = studentDocs.docs.map(doc => ({ id: doc.id, name: doc.data().name, admissionNumber: doc.data().admissionNumber }));

    return { fees, students };
}

export default async function AccountantPage() {
  const { fees, students } = await getData();

  const totalInvoiced = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const totalBalance = totalInvoiced - totalPaid;

  async function handleLogPayment(data: { studentId: string; amount: number; }) {
    'use server';
    
    const feesCollectionRef = collection(db, 'fees');
    const studentFeeDocRef = doc(feesCollectionRef, data.studentId);
    
    const feeDocSnap = await getDoc(doc(db, 'fees', `inv-${data.studentId.split('-')[1]}`));

    if (feeDocSnap.exists()) {
        const feeData = feeDocSnap.data() as Fee;
        const newPaidAmount = feeData.paidAmount + data.amount;
        const newBalance = feeData.amount - newPaidAmount;
        const newStatus = newBalance <= 0 ? 'Paid' : 'Partial';

        await updateDoc(feeDocSnap.ref, {
            paidAmount: newPaidAmount,
            balance: newBalance,
            status: newStatus
        });
        return { success: true };
    }
    return { success: false, message: 'Could not find invoice for the student.' };
  }


  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Finance Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
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
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">KES {totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Tabs defaultValue="invoices" className="w-full">
            <TabsList>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="payments">Log Payment</TabsTrigger>
            </TabsList>
            <TabsContent value="invoices" className='mt-4'>
                <Card>
                    <CardHeader>
                        <CardTitle>Fee Invoices</CardTitle>
                        <CardDescription>View and manage all student fee invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FeeInvoicesTable fees={fees} students={students} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="payments" className='mt-4'>
                 <Card>
                    <CardHeader>
                        <CardTitle>Record Payments</CardTitle>
                        <CardDescription>Log new fee payments from students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LogPaymentForm students={students} onLogPayment={handleLogPayment} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
