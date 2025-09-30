'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';
import { users } from '@/lib/data';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (user && password === '123456') {
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });
      router.push(`/${user.role.toLowerCase()}`);
    } else {
      setError('Invalid email or password.');
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password.',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
          <GraduationCap className="h-12 w-12" />
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Welcome to Mirera Hub
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The all-in-one management system for Mirera High School.
        </p>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-center text-2xl">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@mirera.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
       <div className="mt-4 text-sm text-muted-foreground">
          <p>Use one of the following emails to log in:</p>
          <ul className="mt-2 list-disc list-inside text-xs">
            {users.map(u => <li key={u.id}>{u.email} ({u.role})</li>)}
          </ul>
          <p className="mt-2">The password for all users is: <span className="font-mono font-bold">123456</span></p>
        </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Mirera High School. All rights reserved.</p>
      </footer>
    </div>
  );
}
