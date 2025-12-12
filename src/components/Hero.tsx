// Hero.tsx – Fixed background + Real Supabase stats only
import { ArrowRight, Code, Users, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

const Hero = () => {
  const [stats, setStats] = useState({
    blogs: 0,
    videos: 0,
    courses: 0,
    loading: true,
  });

  const handleJoinWaitlist = () => {
    window.open('/waitlist', '_blank');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [blogsRes, videosRes, coursesRes] = await Promise.all([
          supabase.from('blogs').select('id', { count: 'exact', head: true }),
          supabase.from('videos').select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          blogs: blogsRes.count ?? 0,
          videos: videosRes.count ?? 0,
          courses: coursesRes.count ?? 0,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image – EXACTLY like your original, with fixed dark overlay for consistent readability across themes */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="RBTechTalks Hero Background"
          className="w-full h-full object-cover" // ← This is the key line – unchanged!
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div> {/* Fixed dark overlay to prevent washout in light mode */}
      </div>

      {/* Content – Force white text for high contrast over image */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Code className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Tech Content Creator</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to{" "}
            <span className="glow-text">RBTechTalks</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"> {/* Changed to white/90 for subtle mute effect */}
            Dive deep into the world of technology with comprehensive blog posts,
            engaging videos, and structured courses designed to elevate your tech skills.
          </p>

          {/* Stats – Now LIVE from Supabase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              {stats.loading ? (
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary/40" />
              ) : (
                <>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.blogs > 50 ? "50+" : stats.blogs}+
                  </div>
                  <div className="text-white/80">Blog Posts</div> {/* White/80 for label contrast */}
                </>
              )}
            </div>

            <div className="text-center">
              {stats.loading ? (
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-accent/40" />
              ) : (
                <>
                  <div className="text-4xl font-bold text-accent mb-2">
                    {stats.videos > 25 ? "25+" : stats.videos}+
                  </div>
                  <div className="text-white/80">Videos</div> {/* White/80 for label contrast */}
                </>
              )}
            </div>

            <div className="text-center">
              {stats.loading ? (
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary/40" />
              ) : (
                <>
                  <div className="text-4xl font-bold text-primary-glow mb-2">
                    {stats.courses > 10 ? "10+" : stats.courses}+
                  </div>
                  <div className="text-white/80">Courses</div> {/* White/80 for label contrast */}
                </>
              )}
            </div>
          </div>

          {/* Exclusive Beta CTA – Unchanged from your last version, with white text overrides */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 max-w-2xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-md border border-primary/20 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="inline-flex items-center space-x-2 bg-primary/20 px-4 py-2 rounded-full text-primary text-sm font-semibold">
                  <Users className="w-4 h-4" />
                  <span>Exclusive Beta</span>
                </div>
                <h3 className="text-3xl font-bold text-white">Ready to master Agentic AI? Join our exclusive beta course today.</h3> {/* Force white for heading */}
                <p className="text-white/90 max-w-md"> {/* White/90 for subtle description */}
                  Unlock the future of intelligent systems with hands-on projects, expert-led modules on autonomous agents, real-world AI applications, and lifetime access to a thriving community of innovators—plus early drops of premium tools and updates that keep you ahead of the curve.
                </p>
                <motion.button
                  onClick={handleJoinWaitlist}
                  className="group inline-flex items-center space-x-3 bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Join Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator – Identical to yours, with white for visibility */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"> {/* White border for light/dark consistency */}
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div> {/* White indicator */}
        </div>
      </div>
    </section>
  );
};

export default Hero;  