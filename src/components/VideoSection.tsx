import { Play, Eye, Clock, ArrowRight, Youtube, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';
import { useState } from "react";

// --- SUB-COMPONENTS ---

const VideoSkeleton = () => (
  <div className="tech-card h-full flex flex-col">
    <div className="aspect-video bg-muted animate-pulse" />
    <div className="p-6 space-y-4 flex-grow">
      <div className="h-6 bg-muted rounded-md w-3/4 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-2/3 animate-pulse" />
      </div>
      <div className="pt-4 mt-auto border-t border-border flex justify-between">
        <div className="h-4 bg-muted rounded-md w-20 animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-12 animate-pulse" />
      </div>
    </div>
  </div>
);

const VideoCard = ({ video }: { video: any }) => {
  const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`);

  const handleImgError = () => {
    setImgSrc(`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`);
  };

  return (
    <Link to={`/videos/${video.id}`} className="group block h-full">
      <article className="tech-card h-full flex flex-col relative group-hover:ring-1 group-hover:ring-primary/50 transition-all duration-300">
        
        {/* Cinematic Thumbnail Wrapper */}
        <div className="relative w-full aspect-video overflow-hidden bg-black rounded-t-xl">
          <img
            src={imgSrc}
            onError={handleImgError}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

          {/* Floating Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
              {video.category || 'Tech'}
            </span>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-4 right-4 z-10">
            <span className="px-2 py-1 bg-black/80 text-white text-xs font-mono font-medium rounded-md border border-white/10 shadow-lg flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {video.duration}
            </span>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px] bg-black/10">
            <div className="w-14 h-14 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] transform scale-50 group-hover:scale-100 transition-transform duration-300">
               <Play className="w-6 h-6 text-white fill-current ml-1" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-card-foreground mb-3 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
            {video.description}
          </p>

          <div className="pt-4 mt-auto border-t border-border flex items-center justify-between text-muted-foreground group-hover:text-foreground transition-colors">
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

  if (error) {
    return (
      <section id="videos" className="py-24 bg-background flex items-center justify-center">
        <div className="text-center max-w-lg px-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-destructive">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Unable to Load Videos</h3>
          <p className="text-muted-foreground mb-6">
            {(error as Error).message || "Something went wrong."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="videos" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Watch & Learn
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Latest Tech <span className="glow-text">Deep Dives</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Master complex topics with high-quality visual tutorials. 
            From system design to live coding sessions.
          </p>
        </div>

        {/* Video Grid */}
        <div className="content-grid mb-20">
          {isLoading ? (
            // Skeleton Loading State
            [1, 2, 3].map((i) => <VideoSkeleton key={i} />)
          ) : (
            videos.map((video) => <VideoCard key={video.id} video={video} />)
          )}
        </div>

        {/* View All & Subscribe Actions */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          
          <Link to="/videos" className="btn-ghost group px-8 py-4 rounded-full text-base">
            <span className="flex items-center gap-2">
               View All Videos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* Premium YouTube Subscribe Card */}
          <a
            href="https://www.youtube.com/@RanjanBatraTechTalks"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
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