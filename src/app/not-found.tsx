
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
            <div className="mx-auto mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                <AlertTriangle className="h-12 w-12" />
            </div>
          <CardTitle className="font-headline text-4xl font-bold">404 - Page Not Found</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Sorry, the page you are looking for does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            It seems you may have followed a broken link or mistyped the URL. Let's get you back on track.
          </p>
          <Button asChild>
            <Link href="/">Go Back to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GITS HIGH. All rights reserved.</p>
      </footer>
    </div>
  );
}
