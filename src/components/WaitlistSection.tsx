import { Mail, User, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react"; // Fixed: Added useEffect
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

  // Dynamic count query (for stats badge) - Graceful 404 handling
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
          console.warn('Waitlist table not found—creating via SQL recommended.');
          return 0;
        }
        throw err; // Re-throw other errors
      }
    },
    staleTime: 5 * 60 * 1000, // Cache 5 mins
    retry: false, // Don't retry 404s
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
      // Send welcome email via your Edge Function
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
        console.warn('Welcome email failed (non-blocking):', emailErr);
      }
      
      setStatus('success');
      setMessage('Welcome to the waitlist! You\'ll hear from us soon 🚀');
      setFormData({ email: '' });
      queryClient.invalidateQueries({ queryKey: ['waitlistCount'] }); // Refresh count
    },
    onError: (error: any) => {
      console.error('Waitlist error:', error); // For debugging
      if (error.message.includes('404') || error.message.includes('relation')) {
        setMessage('Waitlist setup issue—contact support to enable.');
      } else if (error.message.includes('duplicate key')) {
        setMessage('You\'re already on the waitlist!');
      } else {
        setMessage('Something went wrong. Try again.');
      }
      setStatus('error');
    },
  });

  // Auto-hide messages (Fixed: Now uses useEffect)
  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => setStatus('idle'), status === 'success' ? 10000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus('error');
      setMessage('Please enter a valid email.');
      return;
    }
    setStatus('loading');
    mutation.mutate(formData);
  };

  if (status === 'success') {
    return (
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-md mx-auto tech-card p-8 space-y-6">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h3 className="text-2xl font-bold text-foreground">{message}</h3>
            <Link to="/blog" className="btn-ghost flex items-center justify-center mx-auto">
              Explore Content <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Join the <span className="glow-text">Waitlist</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Be the first to access exclusive content, beta features, and upcoming courses. No spam—ever.
          </p>
          {/* Dynamic Stat Badge */}
          <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <CheckCircle className="w-4 h-4 mr-2" />
            {countLoading ? 'Loading...' : countError ? 'Setup in progress' : `${waitlistCount.toLocaleString()}+ developers already joined`}
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-md mx-auto">
          <div className="tech-card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input (Optional) */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full btn-accent flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              {status === 'error' && (
                <p className="text-sm text-destructive text-center">{message}</p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                We respect your privacy. See our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;