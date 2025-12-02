// Footer.jsx
import { Code, Youtube, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../utils/supabaseClient';
import WaitlistFooter from './WaitlistFooter';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "YouTube", icon: Youtube, href: "#", color: "hover:text-red-500" },
    { name: "GitHub", icon: Github, href: "#", color: "hover:text-white" },
    { name: "Twitter", icon: Twitter, href: "#", color: "hover:text-blue-400" },
    { name: "LinkedIn", icon: Linkedin, href: "#", color: "hover:text-blue-600" },
    { name: "Email", icon: Mail, href: "#", color: "hover:text-primary" },
  ];

  const quickLinks = [
    { name: "Blog", href: "#blog" },
    { name: "Videos", href: "#videos" },
    { name: "Courses", href: "#courses" },
    { name: "About", href: "#about" },
  ];

  const resources = [
    { name: "Newsletter", href: "#" },
    { name: "Resources", href: "#" },
    { name: "Community", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (message.text) {
      const timeout = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timeout);
    }
  }, [message.text]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setMessage({ type: '', text: '' });
      setIsSubmitting(true);

      const emailTrimmed = (email || '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        throw new Error('Invalid email format');
      }

      // Upsert to prevent duplicates and race conditions
      const { error: upsertError } = await supabase
        .from('newsletter')
        .upsert([{ email: emailTrimmed }], { onConflict: 'email' });

      if (upsertError) throw upsertError;

      // Fetch the row so we can get the unsubscribe_token
      const { data: row, error: fetchError } = await supabase
        .from('newsletter')
        .select('email, unsubscribe_token')
        .eq('email', emailTrimmed)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!row) throw new Error('Failed to create subscription');

      // Build confirmation/unsubscribe links — replace domain if you want website URLs instead
      const FUNCTIONS_DOMAIN = 'https://vvjaqiowlgkabmchvmhi.functions.supabase.co'; // change if needed
      const confirmUrl = `${FUNCTIONS_DOMAIN}/confirm-subscription?token=${row.unsubscribe_token}`;
      const unsubscribeUrl = `${FUNCTIONS_DOMAIN}/unsubscribe?token=${row.unsubscribe_token}`;

      // Prepare email body
      const body = {
        to: emailTrimmed,
        subject: 'Confirm your RBTechTalks subscription',
        html: `<p>Thanks for subscribing to RBTechTalks! Please confirm by clicking the link below:</p>
               <p><a href="${confirmUrl}">Confirm subscription</a></p>
               <p>If you did not sign up, you can <a href="${unsubscribeUrl}">unsubscribe</a>.</p>`,
        text: `Confirm: ${confirmUrl}\nUnsubscribe: ${unsubscribeUrl}`
      };

      // Invoke the send-email edge function
      const res = await supabase.functions.invoke('send-email', { body });

      // supabase client versions may return { error } or { data, error } — handle both
      if (res.error) {
        console.error('Edge function returned error:', res.error);
        throw res.error;
      }

      // If the function returns structured data with an error inside data
      if (res.data && res.data.error) {
        console.error('send-email function data error:', res.data);
        throw new Error(res.data.error || 'Email function returned an error');
      }

      setMessage({
        type: 'success',
        text: 'Subscribed! Check your inbox to confirm the subscription.',
      });
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage({
        type: 'error',
        text: (error && error.message) ? error.message : String(error) || 'Failed to subscribe. Try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold glow-text">RBTechTalks</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Empowering developers and tech enthusiasts with quality content, tutorials, 
              and courses. Join our community and level up your tech skills.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`p-2 rounded-lg bg-card border border-card-border hover:border-primary/40 transition-all duration-200 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Waitlist Footer (New: Compact waitlist CTA) */}
        <WaitlistFooter />

        {/* Newsletter Section */}
        <div className="py-8 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold mb-2">Stay Updated with Newsletter</h3>
            <p className="text-muted-foreground mb-6">
              Get the latest tech insights, tutorials, and course updates delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <motion.input
                className="flex-1 px-4 py-2 rounded-lg bg-card border border-card-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`btn-accent whitespace-nowrap ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? 'Submitting...' : 'Subscribe'}
              </motion.button>
            </form>
            <AnimatePresence>
              {message.text && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`mt-3 p-3 rounded-lg text-sm ${
                    message.type === 'error' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-green-500/20 text-green-500 border border-green-500/20'
                  }`}
                  role="alert"
                  aria-live="polite"
                >
                  {message.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm">
            © {currentYear} RBTechTalks. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center mt-2 sm:mt-0">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1" fill="currentColor" /> for the tech community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
