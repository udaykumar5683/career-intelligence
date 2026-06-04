'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ShieldCheck, 
  Brain, 
  TrendingUp, 
  Sparkles, 
  Briefcase, 
  Search, 
  FileText, 
  ArrowRight,
  ChevronRight,
  Database,
  BarChart3,
  Cpu,
  Users,
  Zap,
  Globe,
  Lock,
  MessageSquare,
  Map,
  Target,
  LayoutDashboard,
  CheckCircle2,
  LineChart,
  ArrowUpRight,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

// --- Components ---

import { Navbar } from '@/components/layout/navbar';

// --- Animated Counter ---
const AnimatedCounter = ({ value, duration = 2 }: { value: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = (totalMiliseconds / end) > 10 ? (totalMiliseconds / end) : 10;
    
    let timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group relative h-full"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-amber-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
    <Card className="relative bg-card/50 backdrop-blur-xl border-white/10 overflow-hidden hover:border-teal-500/30 transition-all rounded-3xl h-full hover:shadow-2xl hover:shadow-teal-500/10">
      <CardContent className="p-8">
        <div className="bg-teal-500/10 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
          <Icon className="h-6 w-6 text-teal-600" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const StepCard = ({ number, title, description, icon: Icon, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex gap-6 relative"
  >
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg shrink-0 z-10 shadow-lg shadow-teal-600/20">
        {number}
      </div>
      <div className="w-0.5 h-full bg-teal-100 dark:bg-slate-800 absolute top-12 -z-0" />
    </div>
    <div className="pb-12 pt-1">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-5 w-5 text-teal-600" />
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  </motion.div>
);

const AgentCard = ({ name, role, icon: Icon }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center gap-4"
  >
    <div className="bg-teal-500/20 p-4 rounded-full">
      <Icon className="h-8 w-8 text-teal-400" />
    </div>
    <div>
      <h4 className="font-bold text-slate-100">{name}</h4>
      <p className="text-xs text-teal-400 font-medium tracking-wider uppercase">{role}</p>
    </div>
  </motion.div>
);

const TestimonialCard = ({ quote, author, role, company, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-card border p-8 rounded-3xl relative"
  >
    <div className="flex gap-1 mb-4 text-amber-500">
      {[1, 2, 3, 4, 5].map(i => <Sparkles key={i} className="h-4 w-4 fill-current" />)}
    </div>
    <p className="text-lg mb-6 italic">"{quote}"</p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-200" />
      <div>
        <div className="font-bold">{author}</div>
        <div className="text-sm text-muted-foreground">{role} @ {company}</div>
      </div>
    </div>
  </motion.div>
);

const StatCard = ({ value, label }: any) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-extrabold text-teal-600 mb-2">
      <AnimatedCounter value={value} />
    </div>
    <p className="text-muted-foreground font-medium">{label}</p>
  </div>
);

const chartData = [
  { month: 'Jan', value: 45 },
  { month: 'Feb', value: 52 },
  { month: 'Mar', value: 48 },
  { month: 'Apr', value: 61 },
  { month: 'May', value: 55 },
  { month: 'Jun', value: 67 },
  { month: 'Jul', value: 72 },
  { month: 'Aug', value: 85 },
];

const dashboardSlides = [
  {
    title: "Career Intelligence Dashboard",
    description: "Get a bird's-eye view of your professional standing with AI-driven metrics.",
    image: "/dashboard-preview.png",
    icon: LayoutDashboard
  },
  {
    title: "AI Career Mentor",
    description: "Interactive AI assistant trained to guide you through complex career decisions.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2340",
    icon: MessageSquare
  },
  {
    title: "Job Recommendations",
    description: "Discover roles that perfectly align with your current skills and future potential.",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=2340",
    icon: Target
  },
  {
    title: "Skill Analytics",
    description: "Visualize your progress and identify the exact skills needed to level up.",
    image: "/dashboard-preview.png",
    icon: Zap
  }
];

// --- Main Page ---

export default function LandingPage() {
  const heroRef = useRef(null);
  const [activeMarketTab, setActiveMarketTab] = useState('demand');
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  const marketData = [
    { name: 'React', demand: 95, growth: '+12%' },
    { name: 'Node.js', demand: 88, growth: '+8%' },
    { name: 'Python', demand: 92, growth: '+15%' },
    { name: 'AWS', demand: 85, growth: '+10%' },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-teal-500/30">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 text-sm font-semibold mb-8"
          >
            <Sparkles className="h-4 w-4" />
            Next Generation Career Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
          >
            Your Career, <br />
            <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              Supercharged by AI.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The world's first multi-agent AI platform that analyzes placement risk, predicts salaries, and builds personalized career roadmaps.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-7 rounded-2xl shadow-xl shadow-teal-600/20 gap-2 h-auto">
                Start Free Analysis <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-7 rounded-2xl h-auto border-slate-200 hover:bg-slate-50 transition-all">
                Explore Features
              </Button>
            </Link>
          </motion.div>

          {/* Floating Elements Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 relative max-w-6xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 h-full w-full" />
            <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-slate-950 p-3">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
              <img 
                src="/dashboard-preview.png" 
                alt="Platform Preview" 
                crossOrigin="anonymous"
                className="rounded-[24px] opacity-90 w-full object-cover aspect-[16/9]"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-teal-600/20 backdrop-blur-2xl flex items-center justify-center border border-teal-500/40 shadow-[0_0_50px_rgba(20,184,166,0.3)]"
                >
                  <Zap className="h-12 w-12 text-teal-400 fill-teal-400" />
                </motion.div>
              </div>
            </div>

            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 md:right-10 bg-card/80 backdrop-blur-xl border p-4 rounded-2xl shadow-xl z-20 hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Salary Boost</div>
                  <div className="text-lg font-black text-emerald-600">+24% Average</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/3 -left-6 md:left-10 bg-card/80 backdrop-blur-xl border p-4 rounded-2xl shadow-xl z-20 hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">AI Analysis</div>
                  <div className="text-lg font-black text-teal-600">Real-time Insight</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-24 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] -z-10" />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Database className="h-3 w-3" />
              Advanced Capabilities
            </motion.div>
            <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Everything you need to <br /> dominate your industry.</h3>
            <p className="text-lg text-muted-foreground">We've combined 7 specialized AI agents to provide deep insights that were previously only available to elite career coaches.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={Brain} 
              title="AI Resume Analysis" 
              description="Deep semantic analysis of your experience against 10M+ job descriptions to find perfect matches."
              delay={0}
            />
            <FeatureCard 
              icon={FileText} 
              title="OCR Resume Parsing" 
              description="Extract every detail from your PDF or Word resume with 99.9% accuracy, including scanned documents."
              delay={0.1}
            />
            <FeatureCard 
              icon={MessageSquare} 
              title="AI Career Mentor" 
              description="24/7 access to an intelligent assistant trained on global hiring trends and interview strategies."
              delay={0.2}
            />
            <FeatureCard 
              icon={Target} 
              title="Job Intelligence" 
              description="Discover hidden opportunities that perfectly match your skill profile and career aspirations."
              delay={0.3}
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Salary Prediction" 
              description="Know your worth. Get accurate salary estimates based on real market data and location."
              delay={0}
            />
            <FeatureCard 
              icon={Map} 
              title="Career Roadmaps" 
              description="Personalized 3, 6, and 12-month plans to reach your career goals with specific milestones."
              delay={0.1}
            />
            <FeatureCard 
              icon={Zap} 
              title="Skill Tracking" 
              description="Monitor your progress in real-time as you bridge gaps and unlock new career levels."
              delay={0.2}
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="PDF Export" 
              description="Generate professional analysis reports and roadmaps in one click to share with mentors."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-4">The Workflow</h2>
              <h3 className="text-4xl md:text-5xl font-black mb-12 tracking-tight">From Analysis to <br /> Acceleration.</h3>
              
              <div className="space-y-4 relative">
                <StepCard 
                  number="1" 
                  title="Upload Resume" 
                  description="Simply drop your resume. Our OCR engine handles the rest, extracting skills, experience, and achievements."
                  icon={FileText}
                  delay={0}
                />
                <StepCard 
                  number="2" 
                  title="AI Analysis" 
                  description="7 specialized agents coordinate to analyze every aspect of your professional profile against market data."
                  icon={Brain}
                  delay={0.1}
                />
                <StepCard 
                  number="3" 
                  title="Market Intelligence" 
                  description="We compare your profile against real-time market demands, salary trends, and hiring patterns."
                  icon={BarChart3}
                  delay={0.2}
                />
                <StepCard 
                  number="4" 
                  title="Career Prediction" 
                  description="Receive AI-driven forecasts for your career growth, salary potential, and placement success."
                  icon={LineChart}
                  delay={0.3}
                />
                <StepCard 
                  number="5" 
                  title="Job Recommendations" 
                  description="Get matched with high-value roles that you're actually qualified for, ranked by compatibility."
                  icon={Target}
                  delay={0.4}
                />
                <StepCard 
                  number="6" 
                  title="Learning Roadmap" 
                  description="Follow a step-by-step guide to bridge skill gaps and land your target role with specific resources."
                  icon={Map}
                  delay={0.5}
                />
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-[120px] -z-10" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="h-6 w-32 bg-slate-800 rounded-lg animate-pulse ml-4" />
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-teal-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 bg-slate-700 rounded-full" />
                      <div className="h-2 w-full bg-slate-800 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-5 -top-4 -bottom-4 w-px bg-slate-800 border-dashed border-l" />
                    <div className="flex items-center gap-6 justify-center py-4">
                      <div className="w-12 h-12 rounded-full bg-teal-600/20 border border-teal-500/40 flex items-center justify-center animate-bounce">
                        <Cpu className="h-6 w-6 text-teal-400" />
                      </div>
                      <div className="text-teal-400 text-sm font-mono tracking-tighter">ORCHESTRATING AGENTS...</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400">98% MATCH</span>
                      </div>
                      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '98%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-400">GAP DETECTED</span>
                      </div>
                      <div className="h-2 w-full bg-slate-700 rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI AGENT ARCHITECTURE SECTION */}
      <section id="ai-agents" className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-dark.svg')] bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-teal-500/20 text-teal-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-6"
            >
              System Architecture
            </motion.div>
            <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Multi-Agent AI Core.</h3>
            <p className="text-slate-400 text-lg leading-relaxed">Our proprietary AI orchestration pipeline connects 7 specialized agents that work together in parallel to decode your career DNA and market positioning.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <AgentCard name="Resume Agent" role="Semantic Parsing" icon={FileText} />
            <AgentCard name="Skill Gap Agent" role="Deficit Analysis" icon={Target} />
            <AgentCard name="Salary Agent" role="Market Valuation" icon={TrendingUp} />
            <AgentCard name="Market Agent" role="Intelligence" icon={Globe} />
            <AgentCard name="Job Agent" role="Strategic Matching" icon={Briefcase} />
            <AgentCard name="Roadmap Agent" role="Growth Strategy" icon={Map} />
            <AgentCard name="Risk Agent" role="Placement Risk" icon={ShieldCheck} />
          </div>

          {/* Visualization of Pipeline */}
          <div className="mt-20 relative p-8 md:p-12 rounded-[40px] bg-slate-900/50 border border-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-amber-500/5" />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 shadow-lg shadow-teal-500/10">
                    <Cpu className="h-8 w-8 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Autonomous Orchestration</h4>
                    <p className="text-slate-400">Real-time communication between LLM-powered agents.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Latency', value: '< 2.4s' },
                    { label: 'Accuracy', value: '99.8%' },
                    { label: 'Concurrency', value: 'Parallel' },
                    { label: 'Intelligence', value: 'Agentic' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                      <div className="text-lg font-black text-teal-400">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full max-w-md">
                <div className="relative aspect-square">
                  {/* Central Node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-500/40 flex items-center justify-center z-20">
                    <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center animate-pulse">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Orbiting Nodes */}
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        rotate: [angle, angle + 360],
                      }}
                      transition={{ 
                        duration: 20, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
                    >
                      <div 
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"
                        style={{ transform: `translateY(-50%)` }}
                      >
                        <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Background Rings */}
                  <div className="absolute inset-0 border border-slate-800 rounded-full" />
                  <div className="absolute inset-10 border border-slate-800/50 rounded-full" />
                  <div className="absolute inset-20 border border-slate-800/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DASHBOARD PREVIEW SECTION */}
      <section id="preview" className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-teal-600 tracking-widest uppercase mb-4">The Experience</h2>
            <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Built for Professionals. <br /> Designed for Success.</h3>
            <p className="text-lg text-muted-foreground">Take a look inside the platform that's redefining career management for the AI era.</p>
          </div>

          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent>
              {dashboardSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-4">
                    <div className="space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                        <slide.icon className="h-8 w-8 text-teal-600" />
                      </div>
                      <h4 className="text-4xl font-black tracking-tight">{slide.title}</h4>
                      <p className="text-xl text-muted-foreground leading-relaxed">{slide.description}</p>
                      <ul className="space-y-4">
                        {[
                          "Real-time data synchronization",
                          "Personalized AI insights",
                          "Mobile-responsive design"
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-teal-500" />
                            <span className="font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/signup">
                        <Button size="lg" className="bg-teal-600 hover:bg-teal-700 mt-4 rounded-2xl h-auto py-6 px-8 text-lg">
                          Try This Feature <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-4 bg-teal-500/10 blur-[60px] rounded-full -z-10" />
                      <div className="rounded-[40px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                        <img 
                          src={slide.image} 
                          alt={slide.title} 
                          crossOrigin="anonymous"
                          className="w-full h-auto object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-12">
              <CarouselPrevious className="relative translate-y-0 left-0 h-12 w-12 rounded-2xl" />
              <CarouselNext className="relative translate-y-0 right-0 h-12 w-12 rounded-2xl" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* 6. MARKET INSIGHTS SECTION */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-widest mb-6">
                <LineChart className="h-3 w-3" />
                Live Market Pulse
              </div>
              <h3 className="text-4xl md:text-6xl font-black mb-8 tracking-tight leading-[1.1]">Real-Time Data. <br /> Real Opportunities.</h3>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl">We track over 50,000 job postings and salary updates daily to ensure your career advice is grounded in the current economic reality.</p>
              
              <div className="grid grid-cols-2 gap-6">
                {marketData.map((item, i) => (
                  <motion.div 
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900/50 p-6 rounded-[32px] border border-slate-800 hover:border-teal-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-teal-400 font-black text-lg group-hover:bg-teal-500 group-hover:text-white transition-all">
                        {item.name[0]}
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                        <ArrowUpRight className="h-4 w-4" />
                        {item.growth}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-xl">{item.name}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Market Demand</span>
                        <span className="text-teal-400 font-bold">{item.demand}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-1">Growth Index</h4>
                    <p className="text-slate-500 text-sm">Average across top tech sectors</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveMarketTab('demand')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeMarketTab === 'demand' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      DEMAND
                    </button>
                    <button 
                      onClick={() => setActiveMarketTab('salary')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeMarketTab === 'salary' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      SALARY
                    </button>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#475569" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis hide />
                      <ReTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                        itemStyle={{ color: '#14b8a6', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#14b8a6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 flex items-center justify-between p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Trend</div>
                      <div className="text-xl font-black text-white">+18.4% YOY</div>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 gap-2">
                    Full Report <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PLATFORM STATS SECTION */}
      <section className="py-24 border-y relative overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <StatCard value="150k+" label="Resumes Analyzed" />
            <StatCard value="12M+" label="Data Points Scanned" />
            <StatCard value="98%" label="Prediction Accuracy" />
            <StatCard value="50k+" label="Active Users" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section className="py-24 relative">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[100px] -z-10" />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Users className="h-3 w-3" />
              Social Proof
            </motion.div>
            <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Trusted by professionals <br /> at top companies.</h3>
            <p className="text-lg text-muted-foreground">Join thousands of students and professionals who have accelerated their careers using our AI insights.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="The AI roadmap helped me transition from QA to Full Stack in just 4 months. The skill gap analysis was pinpoint accurate."
              author="Arjun Sharma"
              role="Software Engineer"
              company="Google"
              delay={0}
            />
            <TestimonialCard 
              quote="I finally understood why my resume wasn't getting past ATS. The OCR insights were a game changer for my job search."
              author="Priya Patel"
              role="Product Manager"
              company="Microsoft"
              delay={0.1}
            />
            <TestimonialCard 
              quote="The salary prediction was within 5% of my actual offer. It gave me the data I needed to negotiate with confidence."
              author="Rohan Gupta"
              role="Data Scientist"
              company="Amazon"
              delay={0.2}
            />
          </div>
          
          {/* Logo Cloud Placeholder */}
          <div className="mt-20 flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            {["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"].map(brand => (
              <span key={brand} className="text-2xl font-black tracking-tighter">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-600/5 -z-10" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-slate-900 dark:bg-slate-950 rounded-[60px] p-12 md:p-24 relative overflow-hidden shadow-[0_0_100px_rgba(20,184,166,0.15)] border border-white/10"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid-dark.svg')] bg-center opacity-5" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-sm font-bold uppercase tracking-widest mb-10"
              >
                <Zap className="h-4 w-4 fill-teal-400" />
                Limited Free Access
              </motion.div>
              
              <h3 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                Start Your AI <br /> 
                <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Career Journey</span> Today.
              </h3>
              <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                Join 50,000+ professionals using autonomous AI agents to navigate their careers with absolute confidence and clarity.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/signup">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-xl px-12 py-8 rounded-[24px] h-auto gap-3 shadow-2xl shadow-teal-600/30">
                    Get Started for Free <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-white border-slate-700 hover:bg-slate-800 text-xl px-12 py-8 rounded-[24px] h-auto">
                    Login to Account
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  Cancel anytime
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. PROFESSIONAL FOOTER */}
      <footer className="py-24 border-t bg-slate-50 dark:bg-slate-900/50 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-1 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="bg-teal-600 p-2 rounded-xl shadow-lg shadow-teal-600/20">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter">Career Intelligence</span>
              </Link>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mb-8">
                The world's first multi-agent AI platform empowering professionals with deep insights and autonomous career guidance.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all cursor-pointer">
                    <Globe className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-8">Platform</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="#features" className="hover:text-teal-600 transition-colors">AI Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-teal-600 transition-colors">How it Works</Link></li>
                <li><Link href="#ai-agents" className="hover:text-teal-600 transition-colors">AI Agents</Link></li>
                <li><Link href="#preview" className="hover:text-teal-600 transition-colors">Platform Preview</Link></li>
                <li><Link href="/dashboard" className="hover:text-teal-600 transition-colors">User Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-8">Resources</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="#" className="hover:text-teal-600 transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-teal-600 transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-teal-600 transition-colors">Career Blog</Link></li>
                <li><Link href="#" className="hover:text-teal-600 transition-colors">Market Reports</Link></li>
                <li><Link href="#" className="hover:text-teal-600 transition-colors">Support Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-8">Legal</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-teal-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-teal-600 transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="hover:text-teal-600 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <span>© 2026 Career Intelligence Platform.</span>
              <span className="hidden md:inline">•</span>
              <span>Built with AI by the Career Intelligence Team.</span>
            </div>
            <div className="flex items-center gap-8">
              <Link href="#" className="hover:text-teal-600 transition-colors">Status</Link>
              <Link href="#" className="hover:text-teal-600 transition-colors">GitHub</Link>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEMS OPERATIONAL
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
