import { ArrowRight, Code, Play, BookOpen, Rocket, Loader2, Sparkles, LucideIcon } from "lucide-react";
import heroImage from "@/assets/hero-bg.png";
import { motion, Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

// 1. Define Types for your State and Props
interface DashboardStats {
  blogs: number;
  videos: number;
  courses: number;
  ventures: number;
  loading: boolean;
}

interface StatCardProps {
  icon: LucideIcon; // Correct type for Lucide icons
  label: string;
  count: number;
  loading: boolean;
}

const Hero = () => {
  const [stats, setStats] = useState<DashboardStats>({
    blogs: 0,
    videos: 0,
    courses: 0,
    ventures: 0,
    loading: true,
  });

  const handleJoinWaitlist = () => {
    // Security best practice: open in new tab with references cleared
    window.open('/waitlist', '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    let isMounted = true; // Prevents state updates if component unmounts

    const fetchStats = async () => {
      try {
        // Using 'head: true' is the most efficient way to get count from Supabase
        const [blogsRes, videosRes, coursesRes, venturesRes] = await Promise.all([
          supabase.from('blogs').select('*', { count: 'exact', head: true }),
          supabase.from('videos').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('ventures').select('*', { count: 'exact', head: true }),
        ]);

        if (isMounted) {
          setStats({
            blogs: blogsRes.count ?? 0,
            videos: videosRes.count ?? 0,
            courses: coursesRes.count ?? 0,
            ventures: venturesRes.count ?? 0,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        if (isMounted) {
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Explicitly Type Framer Motion Variants to fix TS errors
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1, 
        delayChildren: 0.3 
      } 
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 50 } 
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-zinc-950 text-white">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="w-full h-full"
        >
          <img 
            src={heroImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-50"
            loading="eager" // Performance optimization for LCP
          />
        </motion.div>
        
        {/* Gradients for readability */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          className="max-w-5xl mx-auto text-center"
        >
          
          {/* Badge */}
          <motion.div variants={item} className="flex justify-center mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-indigo-200 uppercase">Venture Studio Live</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={item} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-8 text-balance">
            Building the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">Agentic AI & Tech.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={item} className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Master the next generation of technology. From comprehensive <span className="text-zinc-200">Full-Stack courses</span> to cutting-edge <span className="text-zinc-200">AI Ventures</span>.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button 
              onClick={handleJoinWaitlist}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:scale-105 active:scale-95"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 -z-10 rounded-full blur-xl bg-indigo-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
            <button className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-medium text-zinc-300 transition-all duration-200 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-white backdrop-blur-sm active:scale-95">
              Explore Ventures
            </button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <StatCard icon={Code} label="Blog Posts" count={stats.blogs} loading={stats.loading} />
            <StatCard icon={Play} label="Videos" count={stats.videos} loading={stats.loading} />
            <StatCard icon={BookOpen} label="Courses" count={stats.courses} loading={stats.loading} />
            <StatCard icon={Rocket} label="Ventures" count={stats.ventures} loading={stats.loading} />
          </motion.div>

          {/* Beta Access Card */}
          <motion.div variants={item} className="mt-16 mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-1 group">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-zinc-950/50">
                <div className="flex-shrink-0 p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-white mb-1">Agentic AI Beta Access</h3>
                  <p className="text-sm text-zinc-400">Join 500+ developers building autonomous agents. Get early access to the protocol.</p>
                </div>
                <button 
                  onClick={handleJoinWaitlist} 
                  className="flex-shrink-0 px-5 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors"
                >
                  Join Beta
                </button>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

// 3. Properly Typed StatCard Component
const StatCard = ({ icon: Icon, label, count, loading }: StatCardProps) => (
  <motion.div 
    whileHover={{ y: -5 }} 
    className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/10 transition-all duration-300"
  >
    <Icon className="w-6 h-6 text-indigo-400 mb-3" />
    <div className="text-3xl font-bold text-white mb-1 h-9 flex items-center">
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-zinc-600" aria-label="Loading stats" />
      ) : (
        <span>{count}+</span>
      )}
    </div>
    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</div>
  </motion.div>
);

export default Hero;