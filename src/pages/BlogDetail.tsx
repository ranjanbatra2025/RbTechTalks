import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Calendar, Clock } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

const BlogDetail = () => {
  const { id } = useParams();

  const { data: post, error, isLoading } = useQuery({
    queryKey: ['blogPost', id],
    queryFn: async () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) throw new Error('Invalid blog ID format');

      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, subtitle, image_url, date, read_time, full_description')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Blog not found');

      return {
        id: data.id,
        title: data.title,
        excerpt: data.subtitle,
        image: data.image_url || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60',
        date: data.date,
        readTime: `${data.read_time} min read`,
        fullDescription: data.full_description,
      };
    },
  });

  if (isLoading) {
    return <div className="py-20 text-center text-2xl text-muted-foreground">Loading...</div>;
  }

  if (error || !post) {
    return <div className="py-20 text-center text-2xl text-muted-foreground">{error?.message || 'Blog not found'}</div>;
  }

  return (
    <section className="py-20 bg-background">
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
              <span>{post.readTime}</span>
            </div>
          </div>
          <div className="prose prose-invert prose-headings:text-foreground prose-a:text-primary max-w-none mb-8">
            <ReactMarkdown>{post.fullDescription}</ReactMarkdown>
          </div>
        </article>
      </div>
    </section>
  );
};

export default BlogDetail;