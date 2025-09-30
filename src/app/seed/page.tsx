'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seedDatabase } from '@/lib/seed';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);
    const response = await seedDatabase();
    setResult(response);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Click the button to populate your Firestore database with the initial mock data. This should only be done once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSeed} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              'Seed Database'
            )}
          </Button>

          {result && (
            <div className={`mt-4 flex items-start rounded-md p-3 ${result.success ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              {result.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
              )}
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {result.success ? 'Success' : 'Error'}
                </h3>
                <p className={`mt-1 text-sm ${result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {result.message}
                </p>
                {result.success && (
                    <Button asChild variant="link" className="p-0 h-auto mt-2">
                        <Link href="/">Go to Home Page</Link>
                    </Button>
                )}
              </div>
            </div>
          )}
           {!isLoading && !result && (
             <div className="mt-4 text-sm text-muted-foreground">
                Before you seed, make sure you have enabled the Firestore Database in your Firebase project console and configured the security rules to allow writes. For development, you can use the test rules:
                <pre className="mt-2 rounded-md bg-muted p-2 text-xs font-mono">
                    <code>{`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`}</code>
                </pre>
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
