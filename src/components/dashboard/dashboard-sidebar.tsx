'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  User,
  Book,
  ClipboardCheck,
  GraduationCap,
  Banknote,
  Presentation,
  FileText,
  PenSquare,
  LogOut,
  Cog,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const commonLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const adminLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/teachers', label: 'Teachers', icon: User },
  { href: '/admin/classes', label: 'Classes', icon: Book },
  { href: '/admin/users', label: 'System Users', icon: Cog },
];

const deanLinks = [
  { href: '/dean', label: 'Academics', icon: LayoutDashboard },
  { href: '/dean/students', label: 'Students', icon: Users },
  { href: '/dean/exams', label: 'Exams & Marks', icon: GraduationCap },
  { href: '/dean/analysis', label: 'Analysis', icon: Presentation },
];

const teacherLinks = [
  { href: '/teacher', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/teacher/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/teacher/marks', label: 'Enter Marks', icon: PenSquare },
  { href: '/teacher/reports', label: 'AI Reports', icon: Bot },
];

const accountantLinks = [
  { href: '/accountant', label: 'Finance', icon: LayoutDashboard },
  { href: '/accountant/invoices', label: 'Invoices', icon: FileText },
  { href: '/accountant/payments', label: 'Payments', icon: Banknote },
  { href: '/accountant/balances', label: 'Fee Balances', icon: Presentation },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const role = pathname.split('/')[1] || 'admin';

  let links = commonLinks;
  let roleTitle = 'Dashboard';

  switch (role) {
    case 'admin':
      links = adminLinks;
      roleTitle = 'Admin Portal';
      break;
    case 'dean':
      links = deanLinks;
      roleTitle = 'Dean\'s Portal';
      break;
    case 'teacher':
      links = teacherLinks;
      roleTitle = 'Teacher\'s Portal';
      break;
    case 'accountant':
      links = accountantLinks;
      roleTitle = 'Accountant\'s Portal';
      break;
    default:
      links = adminLinks;
      roleTitle = 'Admin Portal';
  }

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-lg font-semibold text-sidebar-foreground">
            GITS HIGH
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton
                  isActive={pathname === link.href || (link.href !== `/${role}` && pathname.startsWith(link.href))}
                  className={cn(
                    'w-full justify-start',
                    (pathname === link.href || (link.href !== `/${role}` && pathname.startsWith(link.href)))
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent'
                  )}
                  tooltip={link.label}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Separator className="my-2 bg-sidebar-border" />
         <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
            </Button>
         </Link>
      </SidebarFooter>
    </>
  );
}

    