import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
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

  if (isLoading) return <div className="py-20 text-center">Loading...</div>;

  return (
    <section id="blog" className="py-24 bg-[#020617]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Latest <span className="text-primary">Insights</span></h2>
            <p className="text-slate-400 max-w-xl">Deep dives into Agentic AI, Software Architecture, and the future of web development.</p>
          </div>
          <Link to="/blog" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
            View All <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group block">
              <article className="h-full bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 group-hover:bg-white/[0.08] group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:border-primary/50">
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={post.image_url || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                     <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 uppercase tracking-tighter">
                        {post.tags?.[0] || "Tech"}
                     </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(post.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {post.read_time} min</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {post.subtitle}
                  </p>

                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    Read Story <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;