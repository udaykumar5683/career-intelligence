import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  BarChart3, 
  ShieldAlert,
  Search,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-primary">
            <ShieldAlert className="size-6" />
            <span>Career Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <AdminNavLink href="/admin" icon={<LayoutDashboard className="size-4" />} label="Overview" />
          <AdminNavLink href="/admin/users" icon={<Users className="size-4" />} label="Users" />
          <AdminNavLink href="/admin/reports" icon={<FileText className="size-4" />} label="Reports" />
          <AdminNavLink href="/admin/analytics" icon={<BarChart3 className="size-4" />} label="Analytics" />
          <AdminNavLink href="/admin/chat" icon={<MessageSquare className="size-4" />} label="Chat History" />
          <AdminNavLink href="/admin/system" icon={<Settings className="size-4" />} label="System Health" />
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
            <LogOut className="size-4" />
            <span>Exit Dashboard</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-8">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Global search..."
                className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">System Administrator</p>
            </div>
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center border">
              <Users className="size-5 text-primary" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
