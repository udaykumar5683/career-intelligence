'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="bg-teal-600 p-2 rounded-xl shadow-lg shadow-teal-600/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Career Intelligence</span>
          </Link>
          <h1 className="text-3xl font-bold text-center mb-2">Secure Access</h1>
          <p className="text-muted-foreground text-center">
            Sign in to analyze resumes and save your reports
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-8 shadow-xl shadow-teal-900/5">
          <AuthForm onSuccess={() => window.location.href = '/dashboard'} />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
