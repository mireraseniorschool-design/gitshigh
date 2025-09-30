import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, User, PenSquare, Banknote } from 'lucide-react';

const roles = [
  { name: 'Admin', href: '/admin', icon: Shield },
  { name: 'Dean of Studies', href: '/dean', icon: PenSquare },
  { name: 'Teacher', href: '/teacher', icon: User },
  { name: 'Accountant', href: '/accountant', icon: Banknote },
];

export default function LoginPage() {
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
            Select Your Role
          </CardTitle>
          <CardDescription className="text-center">
            Choose your role to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {roles.map((role) => (
              <Button
                key={role.name}
                asChild
                variant="outline"
                size="lg"
                className="h-auto justify-start p-4 text-left"
              >
                <Link href={role.href} className="flex items-center gap-4">
                  <role.icon className="h-6 w-6 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-semibold">{role.name}</span>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Mirera High School. All rights reserved.</p>
      </footer>
    </div>
  );
}
