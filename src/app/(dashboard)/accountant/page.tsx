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
import { FileText, Banknote, Presentation, IndianRupee } from 'lucide-react';
import { fees } from '@/lib/data';

const totalInvoiced = fees.reduce((sum, fee) => sum + fee.amount, 0);
const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
const totalBalance = totalInvoiced - totalPaid;

const InvoiceManagement = () => (
    <Card>
        <CardHeader>
            <CardTitle>Fee Invoices</CardTitle>
            <CardDescription>View and manage all student fee invoices.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Invoice management table will be here.</p>
        </CardContent>
    </Card>
)

const PaymentLogging = () => (
    <Card>
        <CardHeader>
            <CardTitle>Record Payments</CardTitle>
            <CardDescription>Log new fee payments from students.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Payment recording interface will be here.</p>
        </CardContent>
    </Card>
)

export default function AccountantPage() {
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
            <Presentation className="h-4 w-4 text-muted-foreground" />
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
                <InvoiceManagement />
            </TabsContent>
            <TabsContent value="payments" className='mt-4'>
                <PaymentLogging />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
