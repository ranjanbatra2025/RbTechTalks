import { useParams } from "react-router-dom";
import { Calendar, Clock, Eye } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

const VideoDetail = () => {
  const { id } = useParams();

  const { data: post, error, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) throw new Error('Invalid video ID format');

      const { data, error } = await supabase
        .from('videos')
        .select('id, title, description, youtube_id, date, duration, views')
        .eq('id', id)
        .maybeSingle();
      console.log('Fetched ID:', id); // Debug: Log the URL param
      console.log('Supabase response:', data, error); // Debug: See what comes back
      if (error) throw error;
      if (!data) throw new Error('Video not found');

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        duration: data.duration,
        views: data.views,
        youtube_id: data.youtube_id,
        image: `https://img.youtube.com/vi/${data.youtube_id}/maxresdefault.jpg`,
      };
    },
  });

  if (isLoading) {
    return <div className="py-20 text-center text-2xl text-muted-foreground">Loading...</div>;
  }

  if (error || !post) {
    return <div className="py-20 text-center text-2xl text-muted-foreground">{error?.message || 'Video not found'}</div>;
  }

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <article>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
          <h1 className="text-4xl font-bold mb-4 glow-text">{post.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{post.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views} views</span>
            </div>
          </div>
          <div className="aspect-video mb-8 rounded-lg overflow-hidden">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${post.youtube_id}?autoplay=1&mute=1`} // Added autoplay and mute for auto-play (mute required for reliability)
              title={post.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="prose prose-invert prose-headings:text-foreground prose-a:text-primary max-w-none mb-8">
            <p>{post.description}</p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default VideoDetail;