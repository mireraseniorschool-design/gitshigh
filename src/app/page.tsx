
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
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { users } from '@/lib/data';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    setPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
        setError('Something went wrong. Please go back and select your role.');
        return;
    }

    const user = users.find((u) => u.role === selectedRole);

    if (user && password === '123456') {
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });
      router.push(`/${user.role.toLowerCase()}`);
    } else {
      setError('Invalid password.');
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid password.',
      });
    }
  };

  const handleGoBack = () => {
    setSelectedRole(null);
    setError('');
    setPassword('');
  }

  const roles: UserRole[] = ['Admin', 'Dean', 'Teacher', 'Accountant'];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
          <GraduationCap className="h-12 w-12" />
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Welcome to GITS HIGH
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The all-in-one management system for GITS HIGH.
        </p>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-center text-2xl">
            {selectedRole ? `Sign In as ${selectedRole}` : 'Select Your Role'}
          </CardTitle>
          <CardDescription className="text-center">
            {selectedRole ? 'Enter your password to continue.' : 'Choose your user profile to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedRole ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  className="h-24 text-lg font-semibold"
                  onClick={() => handleRoleSelect(role)}
                >
                  {role.toUpperCase()}
                </Button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {error && (
                  <p className="text-sm font-medium text-destructive">{error}</p>
              )}
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleGoBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GITS HIGH. All rights reserved.</p>
      </footer>
    </div>
  );
}
