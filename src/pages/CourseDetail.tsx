// src/pages/CourseDetail.tsx
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { 
  Clock, ChevronLeft, Github, Lightbulb, 
  CheckCircle2, Copy, Check, ArrowUpRight, ArrowRight, 
  PlayCircle, ChevronRight, BookOpen, Star
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";

// --- UTILITIES ---
const slugify = (text: string) => 
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// --- SUB-COMPONENTS ---

// 1. Code Block with Copy Button
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
        <button onClick={handleCopy} className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <div className="overflow-x-auto p-6">
        <code className={`${className} font-mono text-sm leading-relaxed text-slate-200`}>{children}</code>
      </div>
    </div>
  );
};

// 2. Smart Paragraph with Pattern Recognition
const SmartParagraph = ({ children }: { children: React.ReactNode }) => {
  if (typeof children !== 'string') return <p className="leading-relaxed mb-6 text-slate-300 text-lg">{children}</p>;
  const text = children.toString();

  // Pattern: "Lesson X:" or "Step X:" Highlight
  if (/^(Lesson|Step|Module|Phase)\s+\d+/i.test(text)) {
    const [title, ...rest] = text.split(':');
    return (
      <div className="my-10 p-6 bg-primary/5 rounded-2xl border border-primary/10">
        <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-3">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">{title}</span>
        </h3>
        {rest.length > 0 && <p className="text-slate-300 text-lg leading-relaxed pl-9">{rest.join(':').trim()}</p>}
      </div>
    );
  }

  // Pattern: GitHub Repo Card
  if (/github repo:\s*https?:\/\//i.test(text)) {
    const match = text.match(/https?:\/\/[^\s]+/);
    const url = match ? match[0] : '#';
    return (
      <a href={url} target="_blank" rel="noreferrer" className="group block my-8 no-underline">
        <div className="flex items-center justify-between p-5 bg-[#1E293B] hover:bg-[#253248] border border-white/10 rounded-xl transition-all duration-300 hover:border-primary/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black/30 rounded-lg text-white"><Github className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Source Code</p>
              <p className="font-mono text-white font-medium group-hover:text-primary transition-colors">{url.replace('https://github.com/', '')}</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </a>
    );
  }

  // Pattern: Pro Tips
  if (/^Pro tip:/i.test(text)) {
    const content = text.replace(/^Pro tip:/i, '').trim();
    return (
      <div className="relative my-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden">
        <div className="flex gap-4 relative z-10">
          <div className="shrink-0 p-2 bg-amber-500/10 rounded-lg h-fit"><Lightbulb className="w-5 h-5 text-amber-500" /></div>
          <div>
            <p className="font-bold text-amber-500 mb-1 text-sm uppercase tracking-wide">Pro Tip</p>
            <p className="text-amber-100/90 text-lg leading-relaxed italic">"{content}"</p>
          </div>
        </div>
      </div>
    );
  }

  return <p className="leading-relaxed mb-6 text-slate-300 text-lg">{children}</p>;
};

// --- MAIN COMPONENT ---

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Course
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch Lessons
  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ['lessons', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_num', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Set default active lesson
  useEffect(() => {
    if (lessons.length > 0 && !activeLessonId) {
      setActiveLessonId(lessons[0].id);
    }
  }, [lessons, activeLessonId]);

  const activeLesson = useMemo(() => 
    lessons.find((l: any) => l.id === activeLessonId) || lessons[0], 
    [lessons, activeLessonId]
  );

  const currentIndex = lessons.findIndex((l: any) => l.id === activeLessonId);

  const handleEnroll = async () => {
    if (!course || !user) {
      navigate(`/login?redirect=${encodeURIComponent(`/courses/${id}`)}`);
      return;
    }
    setLoading(true);
    try {
      if (course.price === 0) {
        await supabase.from('enrollments').insert({ user_id: user.id, course_id: course.id });
        alert('Enrolled successfully!');
        window.location.reload();
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ courseId: course.id, userId: user.id }),
        });
        const { url } = await response.json();
        if (url) window.location.href = url;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FULL MARKDOWN COMPONENT CONFIGURATION ---
  const MarkdownComponents = {
    // Headers
    h1: ({ children }: any) => <h1 className="text-3xl md:text-4xl font-black mt-12 mb-6 text-white tracking-tight">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-5 text-white border-b border-white/10 pb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl md:text-2xl font-bold mt-8 mb-4 text-white/90">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-lg font-bold mt-6 mb-3 text-white/80 uppercase tracking-wider">{children}</h4>,
    
    // Text formatting
    p: SmartParagraph,
    strong: ({ children }: any) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-slate-200">{children}</em>,
    del: ({ children }: any) => <del className="line-through text-slate-500">{children}</del>,
    
    // Links
    a: ({ href, children }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 font-medium transition-colors">
        {children}
      </a>
    ),

    // Lists (CRITICAL FIX FOR FORMATTING)
    ul: ({ children }: any) => <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300 marker:text-primary">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-slate-300 marker:text-primary font-medium">{children}</ol>,
    li: ({ children }: any) => <li className="pl-2">{children}</li>,

    // Blockquotes
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary/50 pl-6 py-2 my-8 italic text-xl text-slate-300 bg-white/5 rounded-r-lg">
        {children}
      </blockquote>
    ),

    // Code
    code: ({ inline, className, children, ...props }: any) => {
      return !inline ? (
        <CodeBlock className={className}>{children}</CodeBlock>
      ) : (
        <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary font-mono text-sm border border-white/5 mx-1" {...props}>
          {children}
        </code>
      );
    },

    // Media
    img: ({ src, alt }: any) => (
      <figure className="my-10 group">
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
          <img src={src} alt={alt} className="w-full h-auto object-contain" />
        </div>
        {alt && <figcaption className="text-center text-sm text-slate-500 mt-3">{alt}</figcaption>}
      </figure>
    ),
  };

  if (isCourseLoading || isLessonsLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white"><div className="animate-pulse">Loading Course...</div></div>;
  if (!course) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Course not found.</div>;

  return (
    <div className="bg-[#020617] min-h-screen text-slate-300 selection:bg-primary/30">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/courses" className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>All Courses</span>
          </Link>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
               <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
               <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500" /> {course.rating}</span>
             </div>
             <button onClick={handleEnroll} className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20">
               {loading ? '...' : 'Enroll Now'}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-[350px] border-r border-white/5 h-[auto] lg:h-[calc(100vh-80px)] overflow-y-auto sticky top-20 bg-[#020617]">
          <div className="p-8">
            <h2 className="text-white font-bold mb-2">{course.title}</h2>
            <p className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-8">Curriculum — {lessons.length} Lessons</p>
            
            <div className="space-y-2">
              {lessons.map((lesson: any, idx: number) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all text-left group ${
                    activeLessonId === lesson.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                    activeLessonId === lesson.id ? 'bg-primary border-primary text-white' : 'border-slate-700 text-slate-500 group-hover:border-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm font-semibold transition-colors ${activeLessonId === lesson.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {lesson.title}
                    </span>
                    {lesson.thumbnail_url && <span className="text-[10px] text-primary flex items-center gap-1"><PlayCircle className="w-3 h-3" /> Video</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Lesson Content Area */}
        <main className="flex-1 p-6 md:p-12 lg:p-20 max-w-4xl mx-auto lg:mx-0">
          {activeLesson ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Lesson Media */}
              {activeLesson.thumbnail_url && (
                <div className="mb-12 rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-2xl relative group">
                   <img src={activeLesson.thumbnail_url} alt={activeLesson.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                        <PlayCircle className="w-10 h-10 fill-current" />
                      </div>
                   </div>
                </div>
              )}

              <div className="mb-8">
                <span className="text-primary font-bold text-sm tracking-widest uppercase">Lesson {currentIndex + 1}</span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-2 leading-tight">
                  {activeLesson.title}
                </h1>
              </div>

              <article className="prose prose-invert prose-lg max-w-none pb-20">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {activeLesson.content || "_No content provided for this lesson._"}
                </ReactMarkdown>
              </article>

              {/* Navigation Controls */}
              <div className="mt-10 pt-10 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4">
                <button 
                  disabled={currentIndex === 0}
                  onClick={() => setActiveLessonId(lessons[currentIndex - 1].id)}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Previous</p>
                    <p className="text-sm font-semibold text-white">Back</p>
                  </div>
                </button>

                <button 
                  disabled={currentIndex === lessons.length - 1}
                  onClick={() => setActiveLessonId(lessons[currentIndex + 1].id)}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-white/60 font-bold">Up Next</p>
                    <p className="text-sm font-semibold">Continue</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
               <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
               <p className="text-slate-500">Select a lesson from the sidebar to start learning.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default CourseDetail;