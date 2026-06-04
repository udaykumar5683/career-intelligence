'use client';

import { AuthForm } from '@/components/auth/auth-form';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative overflow-hidden">
      {/* Left Side: Brand & Visuals */}
      <div className="hidden md:flex flex-1 bg-slate-950 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20 bg-[url('/grid-dark.svg')] bg-center" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-600/20 via-transparent to-amber-600/10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-600/20 mb-8 mx-auto -rotate-3">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Your Career, <br /> Evolutionized.</h2>
          <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
            Join thousands of professionals using AI to navigate their career paths with absolute clarity.
          </p>
        </motion.div>

        {/* Animated Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-amber-500' : 'bg-slate-800'}`} />
          ))}
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-10 md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-8 group md:hidden">
              <div className="bg-teal-600 p-2 rounded-xl">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Career Intelligence</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Start your free AI career analysis in seconds.
            </p>
          </div>

          <div className="bg-card border rounded-3xl p-8 shadow-xl shadow-teal-900/5 relative overflow-hidden">
            <AuthForm onSuccess={() => window.location.href = '/dashboard'} />
            
            <div className="mt-8 text-center text-sm border-t pt-6">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-teal-600 font-bold hover:text-teal-700 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>

          <Link 
            href="/" 
            className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to landing page
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
