'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Sparkles, TrendingUp, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const featureBadges = [
  { icon: Brain, label: '7 AI Agents', color: 'from-teal-500 to-emerald-600' },
  { icon: TrendingUp, label: 'Real-time Market Data', color: 'from-emerald-500 to-teal-600' },
  { icon: Sparkles, label: 'Smart Predictions', color: 'from-amber-500 to-orange-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const badgeContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.8,
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export function HeroSection() {
  const scrollToUpload = () => {
    const el = document.getElementById('resume-upload');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />

      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      {/* Subtle teal glow accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/8 rounded-full blur-[100px]" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6"
        >
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-amber-400 bg-clip-text text-transparent">
            AI Placement Risk
          </span>
          <br />
          <span className="bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
            & Career Intelligence
          </span>
          <br />
          <span className="text-white">Platform</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Transform confusion into clarity — AI-powered career analysis that predicts your placement outcome
        </motion.p>

        {/* Feature Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12"
          variants={badgeContainerVariants}
        >
          {featureBadges.map((badge) => (
            <motion.div key={badge.label} variants={badgeVariants}>
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm sm:text-base border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-colors cursor-default gap-2"
              >
                <badge.icon className="size-4" />
                {badge.label}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <Button
            size="lg"
            onClick={scrollToUpload}
            className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 rounded-xl"
          >
            Start Analysis
            <ArrowDown className="size-5 ml-2 group-hover:translate-y-0.5 transition-transform" />
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-gray-400"
          >
            <span className="text-xs uppercase tracking-widest">Scroll to begin</span>
            <ArrowDown className="size-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
