import { Mail, ArrowRight } from "lucide-react"; // Removed unused CheckCircle
import { useState, useEffect } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

const WaitlistFooter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Invalid email format');

      // Check duplicate
      const { data: existing, error: selectError } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (selectError) throw selectError;
      if (existing) throw new Error('You\'re already on the waitlist!');

      // Insert
      const { error: insertError } = await supabase.from('waitlist').insert([{ email }]);
      if (insertError) throw insertError;

      // Send welcome email
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Welcome to RBTechTalks Waitlist!',
          html: '<h2>You\'re In! 🎉</h2><p>Exclusive updates coming soon. Thanks for joining!</p><p>RBTechTalks Team</p>',
        },
      });
    },
    onSuccess: () => {
      setStatus('success');
      setMessage('Joined the waitlist! Check your email for updates.');
      setEmail('');
    },
    onError: (error: any) => {
      console.error('Waitlist footer error:', error);
      if (error.message.includes('404') || error.message.includes('relation')) {
        setMessage('Waitlist setup issue—contact support.');
      } else {
        setMessage(error.message || 'Something went wrong. Try again.');
      }
      setStatus('error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    mutation.mutate(email);
  };

  // Auto-hide messages
  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => setStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="bg-primary/5 py-8 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-lg font-semibold mb-4 text-foreground">Ready for exclusive beta access?</p>
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex gap-2">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-accent px-6 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {status === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Joining...
              </>
            ) : (
              <>
                Join <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>
        {status !== 'idle' && (
          <p className={`mt-2 text-sm ${status === 'success' ? 'text-green-600' : 'text-destructive'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default WaitlistFooter;