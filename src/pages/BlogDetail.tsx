import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { 
  Calendar, Clock, ChevronLeft, Github, Lightbulb, 
  CheckCircle2, Copy, Check, ArrowUpRight, Share2, Bookmark 
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';
import { useState, useEffect, useMemo, useRef } from "react";

// --- UTILITIES ---

const slugify = (text: string) => 
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// --- SUB-COMPONENTS ---

// 1. Smart Copy-Paste Code Block
const CodeBlock = ({ children, className }: any) => {
  const [copied, setCopied] = useState(false);
  const textInput = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(textInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0F172A]">
      <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <button 
          onClick={handleCopy}
          className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <div className="overflow-x-auto p-6">
        <code className={`${className} font-mono text-sm leading-relaxed text-slate-200`}>
          {children}
        </code>
      </div>
    </div>
  );
};

// 2. The "Smart" Paragraph Renderer
const SmartParagraph = ({ children }: { children: React.ReactNode }) => {
  // If children is mixed (e.g., bold text + strings), we render normally first
  // Unless it's a pure string that matches our special patterns.
  
  if (typeof children !== 'string') {
    // Edge case: if the user bolds the step like "**Step 1:**", extract text to check
    const content = Array.isArray(children) 
      ? children.map(c => (typeof c === 'string' ? c : '')).join('') 
      : '';
      
    // If complex React nodes, just return generic p to avoid breaking layout
    if (!content) return <p className="leading-relaxed mb-6 text-slate-300 text-lg">{children}</p>;
  }

  const text = children.toString();

  // Pattern 1: "Step X:" Highlight
  // Matches "Step 1:", "Step 0:", "Phase 2" at the start
  if (/^(Step|Phase)\s+\d+/i.test(text)) {
    const [title, ...rest] = text.split(':');
    return (
      <div className="my-8">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-3">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            {title}
          </span>
        </h3>
        {rest.length > 0 && (
          <p className="text-slate-300 text-lg leading-relaxed pl-9">
            {rest.join(':').trim()}
          </p>
        )}
      </div>
    );
  }

  // Pattern 2: GitHub Repo Cards
  // Matches "GitHub Repo: https://..." case insensitive
  if (/github repo:\s*https?:\/\//i.test(text)) {
    const match = text.match(/https?:\/\/[^\s]+/);
    const url = match ? match[0] : '#';
    const displayPath = url.replace('https://github.com/', '');

    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noreferrer" 
        className="group block my-8 no-underline"
      >
        <div className="flex items-center justify-between p-5 bg-[#1E293B] hover:bg-[#253248] border border-white/10 rounded-xl transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black/30 rounded-lg text-white">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Source Code</p>
              <p className="font-mono text-white font-medium group-hover:text-primary transition-colors">
                {displayPath}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </div>
      </a>
    );
  }

  // Pattern 3: Pro Tips
  if (/^Pro tip:/i.test(text)) {
    const content = text.replace(/^Pro tip:/i, '').trim();
    return (
      <div className="relative my-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-amber-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <div className="flex gap-4 relative z-10">
          <div className="shrink-0 p-2 bg-amber-500/10 rounded-lg h-fit">
            <Lightbulb className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-amber-500 mb-1 text-sm uppercase tracking-wide">Pro Tip</p>
            <p className="text-amber-100/90 text-lg leading-relaxed italic">
              "{content}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default elegant paragraph
  return <p className="leading-relaxed mb-6 text-slate-300 text-lg">{children}</p>;
};


// --- MAIN COMPONENT ---

const BlogDetail = () => {
  const { id } = useParams();
  const [activeId, setActiveId] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);

  // 1. Optimized Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Data Fetching
  const { data: post, error, isLoading } = useQuery({
    queryKey: ['blogPost', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('blogs').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Blog not found');
      return {
        ...data,
        readTime: `${data.read_time || '5'} min read`,
        content: data.content || data.full_description || '',
        tags: data.tags || [],
      };
    },
  });

  // 3. Memoized TOC Extraction
  const tocHeadings = useMemo(() => {
    if (!post?.content) return [];
    return post.content.split('\n')
      .filter((line: string) => /^###?\s+/.test(line))
      .map((line: string) => {
        const text = line.replace(/^###?\s+/, '').trim();
        return { text, level: line.startsWith('###') ? 3 : 2, id: slugify(text) };
      });
  }, [post?.content]);

  // 4. Active TOC Observer (The "Steve Jobs" Detail)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' } 
    );

    tocHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocHeadings]);


  // 5. Markdown Components Configuration
  const MarkdownComponents = {
    h1: ({ children }: any) => <h1 id={slugify(children.toString())} className="text-4xl md:text-5xl font-black mt-16 mb-8 scroll-mt-32 text-white tracking-tight">{children}</h1>,
    h2: ({ children }: any) => (
      <h2 id={slugify(children.toString())} className="group flex items-center gap-4 text-2xl md:text-3xl font-bold mt-16 mb-6 scroll-mt-32 text-white border-b border-white/10 pb-4">
        <span className="bg-primary/20 w-2 h-8 rounded-full group-hover:h-12 group-hover:bg-primary transition-all duration-300"></span>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => <h3 id={slugify(children.toString())} className="text-xl md:text-2xl font-bold mt-10 mb-4 scroll-mt-32 text-white/90">{children}</h3>,
    p: SmartParagraph,
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <CodeBlock className={className}>{children}</CodeBlock>
      ) : (
        <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary font-mono text-sm border border-white/5 mx-1" {...props}>
          {children}
        </code>
      );
    },
    a: ({ href, children }: any) => (
      <a href={href} className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 font-medium transition-colors" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    img: ({ src, alt }: any) => (
      <figure className="my-12 group">
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
          <img src={src} alt={alt} className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
        </div>
        {alt && <figcaption className="text-center text-sm text-slate-500 mt-4 italic">Caption: {alt}</figcaption>}
      </figure>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="relative my-12 pl-8 border-l-4 border-primary/50 italic text-xl text-slate-300 bg-gradient-to-r from-primary/5 to-transparent py-4 pr-4 rounded-r-lg">
        <span className="absolute -top-4 left-2 text-6xl text-primary/20 font-serif">"</span>
        {children}
      </blockquote>
    ),
    ul: ({ children }: any) => <ul className="list-disc pl-6 mb-6 space-y-3 text-slate-300 marker:text-primary">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-6 space-y-3 text-slate-300 marker:text-primary">{children}</ol>,
  };

  // --- SKELETON LOADER (Perfection requires handling wait times) ---
  if (isLoading) return (
    <div className="min-h-screen bg-[#020617] pt-32 container mx-auto px-4 max-w-6xl">
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-white/5 rounded-full mb-12"></div>
        <div className="h-4 w-48 bg-white/5 rounded mb-8"></div>
        <div className="h-16 w-3/4 bg-white/10 rounded-lg mb-8"></div>
        <div className="flex gap-4 mb-16">
          <div className="h-6 w-24 bg-white/5 rounded"></div>
          <div className="h-6 w-24 bg-white/5 rounded"></div>
        </div>
        <div className="w-full aspect-video bg-white/5 rounded-3xl mb-12"></div>
        <div className="space-y-4 max-w-3xl">
          <div className="h-4 w-full bg-white/5 rounded"></div>
          <div className="h-4 w-5/6 bg-white/5 rounded"></div>
          <div className="h-4 w-full bg-white/5 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
      <h1 className="text-4xl font-bold mb-4 text-red-500">404 Error</h1>
      <p className="text-slate-400 mb-8">The article you are looking for has vanished.</p>
      <Link to="/blog" className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">Go Back Home</Link>
    </div>
  );

  return (
    <div className="bg-[#020617] min-h-screen text-slate-300 selection:bg-primary/30 font-sans">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-white/5 backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-150 ease-out" 
          style={{ width: `${scrollProgress * 100}%` }} 
        />
      </div>

      <section className="pt-32 pb-32 container mx-auto px-4 max-w-[1400px]">
        {/* Navigation */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-all mb-12 group">
          <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-primary/50 transition-colors">
             <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>Back to Articles</span>
        </Link>

        {/* Header */}
        <header className="max-w-5xl mx-auto text-center mb-20">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full border border-blue-500/20 shadow-[0_0_10px_-3px_rgba(59,130,246,0.3)]">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-10 tracking-tighter leading-[1.05] text-balance bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-slate-400">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <Calendar className="w-4 h-4 text-primary" /> 
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <Clock className="w-4 h-4 text-primary" /> 
                {post.readTime}
             </div>
             {post.author && (
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                 <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-purple-500"></div>
                 <span className="text-white">{post.author}</span>
               </div>
             )}
          </div>
        </header>

        {/* Hero Image */}
        <div className="max-w-6xl mx-auto relative aspect-[21/9] mb-24 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
          <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay z-10"></div>
          <img src={post.image_url || post.image} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-20" />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 max-w-6xl mx-auto relative">
          
          {/* Main Content */}
          <main className="prose prose-invert prose-lg max-w-none order-2 lg:order-1">
             <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
               {post.content}
             </ReactMarkdown>

             {/* Footer inside content area */}
             <div className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-500 font-medium">Found this helpful? Share it.</p>
                <div className="flex gap-4">
                  <button className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white"><Share2 className="w-5 h-5" /></button>
                  <button className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white"><Bookmark className="w-5 h-5" /></button>
                </div>
             </div>
          </main>

          {/* Sidebar (TOC) */}
          <aside className="order-1 lg:order-2 hidden lg:block">
            <div className="sticky top-32">
              {tocHeadings.length > 0 && (
                <div className="relative">
                  {/* Decorative blur behind TOC */}
                  <div className="absolute -inset-4 bg-gradient-to-b from-primary/20 to-purple-500/20 blur-2xl opacity-20 rounded-3xl"></div>
                  
                  <div className="relative p-6 bg-[#0B1121]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-6 text-slate-400">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                      On this page
                    </h4>
                    <nav className="flex flex-col relative border-l border-white/10 pl-4 space-y-1">
                      {tocHeadings.map((h) => {
                        const isActive = activeId === h.id;
                        return (
                          <a 
                            key={h.id} 
                            href={`#${h.id}`} 
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`
                              block py-2 pr-4 text-sm transition-all duration-300 relative
                              ${h.level === 3 ? 'pl-4' : ''}
                              ${isActive 
                                ? 'text-white font-bold translate-x-1' 
                                : 'text-slate-500 hover:text-slate-300'
                              }
                            `}
                          >
                            {isActive && (
                              <span className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_#3b82f6]"></span>
                            )}
                            {h.text}
                          </a>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </aside>

        </div>
      </section>
    </div>
  );
};

export default BlogDetail;