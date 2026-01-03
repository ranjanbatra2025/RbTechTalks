import { ArrowRight, Code, Play, BookOpen, Rocket, Loader2, Sparkles, LucideIcon, Zap } from "lucide-react";
import heroImage from "@/assets/hero-bg.png";
import { motion, Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

// 1. Types
interface DashboardStats {
  blogs: number;
  videos: number;
  courses: number;
  ventures: number;
  loading: boolean;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  count: number;
  loading: boolean;
  color: string; // Added color prop for individual vibrancy
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
    window.open('/waitlist', '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
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
    return () => { isMounted = false; };
  }, []);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
  };

  return (
    // CHANGED: bg-zinc-950 -> bg-[#030014] (Deep space blue/black for richness)
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#030014] text-white">
      
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
            className="w-full h-full object-cover opacity-40 mix-blend-color-dodge" // CHANGED: opacity and blend mode
            loading="eager" 
          />
        </motion.div>
        
        {/* Gradients */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#030014] via-[#030014]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#030014] via-[#030014]/80 to-transparent" />
        
        {/* CHANGED: Blur colors to be more electric */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 blur-[80px] rounded-full mix-blend-screen translate-y-20 translate-x-20" />
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
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-xl shadow-[0_0_20px_-10px_rgba(139,92,246,0.5)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400"></span>
              </span>
              <span className="text-xs font-bold tracking-wide text-violet-200 uppercase">Venture Studio Live</span>
            </div>
          </motion.div>

          {/* Title - CHANGED: Richer Gradient */}
          <motion.h1 variants={item} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 text-balance drop-shadow-2xl">
            Building the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-violet-300">
              Agentic AI & Tech.
            </span>
          </motion.h1>

          {/* Subtitle - CHANGED: zinc-400 -> slate-300 (Blue-ish grey, looks cleaner) */}
          <motion.p variants={item} className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Master the next generation of technology. From comprehensive <span className="text-white font-medium border-b border-blue-500/30">Full-Stack courses</span> to cutting-edge <span className="text-white font-medium border-b border-violet-500/30">AI Ventures</span>.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
            <button 
              onClick={handleJoinWaitlist}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] hover:scale-105 active:scale-95 border border-white/10"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-semibold text-slate-200 transition-all duration-200 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-white backdrop-blur-sm active:scale-95 hover:border-white/20">
              Explore Ventures
            </button>
          </motion.div>

          {/* Stats Grid - CHANGED: Passed specific colors for each stat */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <StatCard icon={Code} label="Blog Posts" count={stats.blogs} loading={stats.loading} color="text-blue-400" />
            <StatCard icon={Play} label="Videos" count={stats.videos} loading={stats.loading} color="text-red-400" />
            <StatCard icon={BookOpen} label="Courses" count={stats.courses} loading={stats.loading} color="text-amber-400" />
            <StatCard icon={Rocket} label="Ventures" count={stats.ventures} loading={stats.loading} color="text-emerald-400" />
          </motion.div>

          {/* Beta Access Card */}
          <motion.div variants={item} className="mt-20 mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl p-[1px] group shadow-2xl">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl bg-[#0A0A1B]/80"> {/* Darker inner bg */}
                
                {/* CHANGED: Icon Container */}
                <div className="flex-shrink-0 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:border-violet-500/50 group-hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] transition-all duration-500">
                  <Sparkles className="w-8 h-8 text-violet-400" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                    Agentic AI Beta Access 
                    <span className="px-2 py-0.5 rounded text-[10px] bg-gradient-to-r from-pink-500 to-violet-500 font-bold uppercase tracking-wider">New</span>
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">Join 500+ developers building autonomous agents. Get early access to the protocol.</p>
                </div>
                
                <button 
                  onClick={handleJoinWaitlist} 
                  className="flex-shrink-0 px-6 py-3 text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

// 3. Improved StatCard: Added colorful icon backgrounds and brighter text
const StatCard = ({ icon: Icon, label, count, loading, color }: StatCardProps) => (
  <motion.div 
    whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.08)" }} 
    className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 group"
  >
    {/* Icon Container with subtle glow */}
    <div className={`mb-4 p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 shadow-inner ${color.replace('text-', 'bg-')}/10`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    
    <div className="text-3xl font-black text-white mb-1 h-9 flex items-center tracking-tight">
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-slate-500" aria-label="Loading stats" />
      ) : (
        // Changed '+' color to text-white
        <span>{count}<span className="text-lg text-white ml-0.5">+</span></span>
      )}
    </div>
    {/* Changed label color to text-white */}
    <div className="text-xs font-bold text-white uppercase tracking-widest">{label}</div>
  </motion.div>
);

export default Hero;