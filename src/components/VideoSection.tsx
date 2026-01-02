import { Play, Eye, Clock, ArrowRight, Youtube, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';
import { useState } from "react";

// --- SUB-COMPONENTS ---

const VideoSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
    <div className="aspect-video bg-muted animate-pulse" />
    <div className="p-5 space-y-4">
      <div className="h-6 bg-muted rounded-md w-3/4 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-2/3 animate-pulse" />
      </div>
      <div className="flex justify-between pt-4 border-t border-border">
        <div className="h-4 bg-muted rounded-md w-20 animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-12 animate-pulse" />
      </div>
    </div>
  </div>
);

const VideoCard = ({ video }: { video: any }) => {
  // Smart image handling: Try High Res, fall back if missing
  const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`);

  const handleImgError = () => {
    // Fallback to standard quality if maxres doesn't exist
    setImgSrc(`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`);
  };

  return (
    <Link to={`/videos/${video.id}`} className="group block h-full">
      <article className="h-full flex flex-col bg-card hover:bg-accent/5 rounded-3xl overflow-hidden border border-border/50 shadow-sm transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)]">
        
        {/* Cinematic Thumbnail Wrapper */}
        <div className="relative w-full aspect-video overflow-hidden bg-black">
          <img
            src={imgSrc}
            onError={handleImgError}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Dark Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Floating Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
              {video.category || 'Tech'}
            </span>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-4 right-4">
            <span className="px-2 py-1 bg-black/80 text-white text-xs font-mono font-medium rounded-md border border-white/10 shadow-lg flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
          </div>

          {/* Play Button Overlay (Animated) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] bg-black/20">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)] transform scale-50 group-hover:scale-100 transition-transform duration-300">
               <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-white fill-current ml-0.5" />
               </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-card-foreground mb-3 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
            {video.description}
          </p>

          <div className="pt-5 mt-auto border-t border-border/50 flex items-center justify-between text-muted-foreground group-hover:text-foreground transition-colors">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
              <Eye className="w-4 h-4 text-primary/70" />
              <span>{Number(video.views).toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1 text-primary text-sm font-bold">
              Watch <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

// --- MAIN COMPONENT ---

const VideoSection = () => {
  const { data: videos = [], error, isLoading } = useQuery({
    queryKey: ['videos', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, description, youtube_id, duration, views, category, date')
        .order('date', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="videos" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20">
            <Sparkles className="w-3 h-3" />
            Watch & Learn
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-foreground">
            Latest Tech <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Deep Dives</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Master complex topics with high-quality visual tutorials. 
            From system design to live coding sessions.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {isLoading ? (
            // Skeleton Loading State
            [1, 2, 3].map((i) => <VideoSkeleton key={i} />)
          ) : error ? (
            <div className="col-span-full text-center py-20">
               <p className="text-destructive font-bold">Failed to load content.</p>
            </div>
          ) : (
            videos.map((video) => <VideoCard key={video.id} video={video} />)
          )}
        </div>

        {/* View All & Subscribe Actions */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          
          <Link to="/videos" className="group relative px-8 py-4 bg-card hover:bg-accent border border-border rounded-full font-bold transition-all shadow-sm hover:shadow-md">
            <span className="flex items-center gap-2">
               View All Videos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Premium YouTube Subscribe Card */}
          <a
            href="https://www.youtube.com/@RanjanBatraTechTalks"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#EF4444_50%,#E2E8F0_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background px-8 py-4 text-sm font-bold text-foreground backdrop-blur-3xl transition-all group-hover:bg-accent/50">
               <Youtube className="w-5 h-5 text-red-600 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" />
               Subscribe on YouTube
               <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
            </span>
          </a>

        </div>

      </div>
    </section>
  );
};

export default VideoSection;