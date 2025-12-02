import { Play, Eye, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

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
      return data.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        duration: v.duration,
        views: v.views,
        thumbnail: `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`,
        category: v.category,
      }));
    },
  });

  if (isLoading) {
    return (
      <section id="videos" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="videos" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-red-500">Failed to load videos: {error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="videos" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tech <span className="glow-text">Videos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Visual learning with comprehensive tutorials, explanations, and live coding sessions
          </p>
        </div>

        {/* Video Grid */}
        <div className="content-grid">
          {videos.map((video) => (
            <Link
              key={video.id}
              to={`/videos/${video.id}`}
              className="block group"
            >
              <div className="tech-card overflow-hidden cursor-pointer">
                {/* Video Thumbnail */}
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-200">
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                      {video.category}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-4 right-4">
                    <span className="px-2 py-1 bg-black/70 text-white rounded text-sm font-medium">
                      {video.duration}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {video.title}
                  </h3>

                  <p className="text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-card-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{video.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{video.duration}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/videos" className="btn-ghost group">
            <span>View All Videos</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* YouTube Channel CTA */}
        <div className="text-center mt-12">
          <div className="tech-card p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mx-auto mb-4">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Subscribe to RBTechTalks</h3>
            <p className="text-muted-foreground mb-6">
              Get notified when I upload new videos and tutorials
            </p>
            <a
              href="https://www.youtube.com/@RBTechTalks" // Replace with your actual channel URL if different
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent"
            >
              Subscribe on YouTube
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;