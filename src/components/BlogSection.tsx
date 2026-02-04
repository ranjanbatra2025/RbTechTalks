import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

const BlogSection = () => {
  const { data: blogPosts = [], error, isLoading } = useQuery({
    queryKey: ['blogPosts', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blogs').select('*').order('date', { ascending: false }).limit(3);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return (
    <div className="py-24 bg-[#020617] flex justify-center items-center">
        <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-primary rounded-full"></div>
            <div className="h-2 w-2 bg-primary rounded-full animation-delay-200"></div>
            <div className="h-2 w-2 bg-primary rounded-full animation-delay-400"></div>
        </div>
    </div>
  );

  return (
    <section id="blog" className="relative py-24 bg-[#020617] overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              <span>From the Blog</span>
            </div>
            
            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Insights</span>
            </h2>
            
            {/* Subtitle - The Improved Part */}
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light border-l-2 border-primary/30 pl-6">
              Deep dives into Agentic AI, Software Architecture, and the future of web development.
            </p>
          </div>

          <Link to="/blog" className="group hidden md:flex items-center gap-2 text-white font-semibold hover:text-primary transition-all duration-300">
            View All Articles 
            <span className="bg-white/10 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group block h-full">
              <article className="h-full flex flex-col bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] hover:-translate-y-2">
                
                {/* Image Container */}
                <div className="relative h-60 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60 z-10" />
                  <img 
                    src={post.image_url || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 z-20">
                     <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-wider shadow-lg">
                       {post.tags?.[0] || "Tech"}
                     </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary"/> {new Date(post.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary"/> {post.read_time} min read</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed flex-grow">
                    {post.subtitle}
                  </p>

                  <div className="flex items-center gap-2 text-white text-sm font-semibold group-hover:text-primary transition-colors pt-4 border-t border-white/5">
                    Read Story <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
            <Link to="/blog" className="inline-flex items-center gap-2 text-white font-bold border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all">
                View All Articles <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;