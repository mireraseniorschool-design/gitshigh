import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Fee, Student } from '@/lib/types';
import { notFound } from 'next/navigation';
import { EditInvoiceForm } from '@/components/dashboard/edit-invoice-form';
import { z } from 'zod';

export async function generateStaticParams() {
  const feesSnapshot = await getDocs(collection(db, 'fees'));
  return feesSnapshot.docs.map(doc => ({ id: doc.id }));
}

async function getData(invoiceId: string) {
    const invoiceDocRef = doc(db, 'fees', invoiceId);
    const invoiceDocSnap = await getDoc(invoiceDocRef);

    if (!invoiceDocSnap.exists()) {
        return { invoice: null, student: null };
    }
    const invoice = { ...invoiceDocSnap.data(), id: invoiceDocSnap.id } as Fee;

    const studentDocRef = doc(db, 'students', invoice.studentId);
    const studentDocSnap = await getDoc(studentDocRef);
    const student = studentDocSnap.exists() ? { ...studentDocSnap.data(), id: studentDocSnap.id } as Student : null;

    return { invoice, student };
}

const updateInvoiceSchema = z.object({
  amount: z.coerce.number().min(0, 'Amount must be a positive number.'),
  paidAmount: z.coerce.number().min(0, "Paid amount must be a positive number."),
  dueDate: z.date(),
});

type UpdateInvoiceData = z.infer<typeof updateInvoiceSchema>;


export default async function EditInvoicePage({ params }: { params: { id: string } }) {
    const { invoice, student } = await getData(params.id);

    if (!invoice || !student) {
        notFound();
    }
    
    async function handleUpdateInvoice(data: UpdateInvoiceData) {
        'use server';
        try {
            const invoiceRef = doc(db, 'fees', invoice!.invoiceId);
            
            if (data.paidAmount > data.amount) {
                return { success: false, message: "Paid amount cannot be greater than the total invoice amount."};
            }

            const newBalance = data.amount - data.paidAmount;
            const newStatus = newBalance <= 0 ? 'Paid' : (data.paidAmount > 0 ? 'Partial' : 'Unpaid');

            await updateDoc(invoiceRef, {
                amount: data.amount,
                paidAmount: data.paidAmount,
                dueDate: data.dueDate.toISOString().split('T')[0],
                balance: newBalance,
                status: newStatus,
            });

            return { success: true, message: "Invoice updated successfully!"};
        } catch (error) {
            console.error("Failed to update invoice:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            return { success: false, message: `Failed to update invoice: ${errorMessage}` };
        }
    }


    return (
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold">Edit Invoice</h1>
          <Card>
            <CardHeader>
              <CardTitle>Invoice #{invoice.invoiceId}</CardTitle>
              <CardDescription>Update details for {student.name}'s invoice.</CardDescription>
            </CardHeader>
            <CardContent>
                <EditInvoiceForm 
                    invoice={invoice}
                    onUpdate={handleUpdateInvoice}
                />
            </CardContent>
          </Card>
        </div>
    );
}
