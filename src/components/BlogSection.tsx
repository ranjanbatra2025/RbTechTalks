import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

const BlogSection = () => {
  const { data: blogPosts = [], error, isLoading } = useQuery({
    queryKey: ['blogPosts', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, subtitle, image_url, date, read_time, tags')
        .order('date', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data.map((b) => ({
        id: b.id,
        title: b.title,
        excerpt: b.subtitle,
        date: b.date,
        readTime: `${b.read_time} min read`,
        tags: b.tags || [], // Assume tags is an array in DB
        image: b.image_url || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60',
      }));
    },
  });

  if (isLoading) {
    return (
      <section id="blog" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="blog" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-red-500">Failed to load blog posts: {error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Latest <span className="glow-text">Blog Posts</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            In-depth articles covering the latest trends, tutorials, and insights in technology
          </p>
        </div>

        {/* Blog Grid */}
        <div className="content-grid">
          {blogPosts.map((post) => (
            <article key={post.id} className="tech-card p-6 group cursor-pointer">
              {/* Featured Image */}
              <div className="relative mb-6 overflow-hidden rounded-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-card-border">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/blog" className="btn-ghost group">
            <span>View All Posts</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;