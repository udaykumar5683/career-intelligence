'use client';

import Link from 'next/link';
import { useSession } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, LogOut, FileText, LayoutDashboard, Briefcase } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const { user, signOut, loading } = useSession();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-teal-600 p-1.5 rounded-lg shadow-lg shadow-teal-600/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:inline-block">
            Career Intelligence
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium mx-4">
          <Link href="/#features" className="hover:text-teal-600 transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-teal-600 transition-colors">Process</Link>
          <Link href="/#ai-agents" className="hover:text-teal-600 transition-colors">AI Core</Link>
          <Link href="/#preview" className="hover:text-teal-600 transition-colors">Preview</Link>
        </div>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-semibold">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="ghost" size="sm" className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-semibold">
                      <Briefcase className="h-4 w-4" />
                      <span className="hidden sm:inline">Find Jobs</span>
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">My Reports</span>
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-teal-100 text-teal-700">
                            {user.email?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href="/dashboard">
                        <DropdownMenuItem className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => signOut()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button 
                      size="sm" 
                      className="!text-[#009689] !bg-[#f3fbfb] border-[1px] border-solid border-[#000000] shadow-[0px_0px_0px_0px_rgba(0,0,0,0.25),0px_0px_0px_0px_rgba(0,0,0,0.25),0px_0px_0px_0px_rgba(0,0,0,0.25),0px_0px_0px_0px_rgba(0,0,0,0.25),0px_1px_2px_0px_rgba(0,0,0,0.25)] hover:bg-[#e6f7f5] hover:!text-[#007a6e]"
                    >
                      Login to Account
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">Sign Up</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
