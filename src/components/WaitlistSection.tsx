import { Mail, User, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

interface WaitlistFormData {
  email: string;
  name?: string;
}

const WaitlistSection = () => {
  const [formData, setFormData] = useState<WaitlistFormData>({ email: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  // Dynamic count query
  const { data: waitlistCount = 0, isLoading: countLoading, error: countError } = useQuery({
    queryKey: ['waitlistCount'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true });
        if (error) throw error;
        return count || 0;
      } catch (err: any) {
        if (err.message.includes('404')) {
          console.warn('Waitlist table not found.');
          return 0;
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (data: WaitlistFormData) => {
      const { error } = await supabase
        .from('waitlist')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
    },
    onSuccess: async () => {
      // Optimistic Success UI immediately
      setStatus('success');
      setMessage('Welcome to the waitlist! You\'ll hear from us soon 🚀');
      setFormData({ email: '' });
      queryClient.invalidateQueries({ queryKey: ['waitlistCount'] });

      // Fire-and-forget email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: formData.email,
            subject: `Welcome to RBTechTalks Waitlist${formData.name ? `, ${formData.name}!` : ''}`,
            html: `
              <h2>You're on the Waitlist! 🎉</h2>
              <p>Hi ${formData.name || 'there'},</p>
              <p>Thanks for joining. You'll get exclusive updates on beta features and new content soon.</p>
              <p>Best,<br/>RBTechTalks Team</p>
            `,
          },
        });
      } catch (emailErr) {
        console.warn('Email trigger failed silently:', emailErr);
      }
    },
    onError: (error: any) => {
      console.error('Waitlist error:', error);
      if (error.message.includes('duplicate key')) {
        setMessage('You\'re already on the waitlist!');
      } else {
        setMessage('Something went wrong. Please try again.');
      }
      setStatus('error');
    },
  });

  // Auto-hide messages
  useEffect(() => {
    if (status !== 'idle' && status !== 'loading') {
      const timer = setTimeout(() => setStatus('idle'), status === 'success' ? 8000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    mutation.mutate(formData);
  };

  if (status === 'success') {
    return (
      <section className="py-24 bg-background relative overflow-hidden flex items-center justify-center min-h-[50vh]">
         {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container px-4 relative z-10">
          <div className="max-w-md mx-auto tech-card p-12 text-center border-green-500/20 shadow-[0_0_50px_-10px_rgba(34,197,94,0.2)]">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold mb-4">You're In!</h3>
            <p className="text-muted-foreground mb-8 text-lg">{message}</p>
            <Link to="/blog" className="btn-accent w-full group">
              Explore Content <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20">
            <Sparkles className="w-3 h-3 mr-2" />
            Early Access
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Join the <span className="glow-text">Waitlist</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Be the first to access exclusive content, beta features, and upcoming courses. No spam—ever.
          </p>
          
          {/* Dynamic Stat Badge */}
          <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
            <div className={`w-2 h-2 rounded-full ${countLoading ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`} />
            {countLoading ? 'Loading stats...' : countError ? 'Join the community' : `${waitlistCount.toLocaleString()}+ developers already joined`}
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-md mx-auto">
          <div className="tech-card p-8 md:p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium ml-1">Name <span className="text-muted-foreground font-normal">(Optional)</span></label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full btn-accent py-3.5 text-base group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Securing your spot...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Join Waitlist
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>

              {/* Error Message */}
              {status === 'error' && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                  {message}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center pt-2">
                By joining, you agree to our <Link to="/privacy" className="text-primary hover:underline underline-offset-4">Privacy Policy</Link>. 
                We respect your inbox.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;