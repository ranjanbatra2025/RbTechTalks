// Footer.jsx
import { Code, Youtube, Github, Twitter, Linkedin, Mail, ArrowRight, Users, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../utils/supabaseClient';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "YouTube", icon: Youtube, href: "https://youtube.com", color: "hover:text-red-500" },
    { name: "GitHub", icon: Github, href: "https://github.com", color: "hover:text-gray-300" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:text-sky-400" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com", color: "hover:text-blue-600" },
    { name: "Email", icon: Mail, href: "mailto:hello@rbtechtalks.com", color: "hover:text-primary" },
  ];

  const quickLinks = [
    { name: "Blog", href: "#blog", icon: "📝" },
    { name: "Videos", href: "#videos", icon: "🎥" },
    { name: "Courses", href: "#courses", icon: "📚" },
    { name: "About", href: "#about", icon: "ℹ️" },
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
        text: 'Subscribed! Check your inbox to confirm.',
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

  const handleJoinWaitlist = () => {
    // Implement waitlist join logic here, e.g., modal, redirect, or API call
    window.open('/waitlist', '_blank'); // Example: Open waitlist page
  };

  return (
    <footer className="bg-gradient-to-b from-muted/20 to-muted/40 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Brand & Socials */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:col-span-1"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                RBTechTalks
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Empowering developers with premium tutorials, courses, and tech insights. Join the future of learning.
            </p>
            <div className="flex items-center space-x-4 pt-1">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className={`group p-2.5 rounded-xl bg-card/80 border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 ${social.color} flex items-center justify-center w-10 h-10`}
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1 space-y-4"
          >
            <h4 className="font-semibold text-foreground text-base mb-4 flex items-center space-x-2">
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-all duration-200 flex items-center space-x-2 group text-sm"
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <span className="text-xs">{link.icon}</span>
                    <span>{link.name}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Enhanced Side-by-Side CTAs */}
        <div className="py-10 border-t border-border/30 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            {/* Beta Access CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left space-y-4"
            >
              <div className="inline-flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full text-primary text-xs font-medium">
                <Users className="w-3 h-3" />
                <span>Exclusive Beta</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Ready for exclusive beta access?</h3>
              <p className="text-muted-foreground text-sm">Be the first to experience cutting-edge features.</p>
              <motion.button
                onClick={handleJoinWaitlist}
                className="group inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Join Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.button>
            </motion.div>

            {/* Newsletter CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center lg:text-right space-y-4"
            >
              <div className="inline-flex items-center justify-end lg:justify-start space-x-2 bg-accent/10 px-3 py-1 rounded-full text-accent text-xs font-medium">
                <Send className="w-3 h-3" />
                <span>Stay in the Loop</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Stay Updated</h3>
              <p className="text-muted-foreground text-sm">Latest tech insights and updates straight to your inbox.</p>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto lg:ml-auto">
                <motion.input
                  className="flex-1 px-4 py-3 rounded-xl bg-card border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm placeholder:text-muted-foreground"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                  whileFocus={{ scale: 1.02, borderColor: '#3b82f6' }}
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${isSubmitting 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-gradient-to-r from-secondary to-muted-foreground text-primary hover:from-primary/90 hover:to-accent/90 hover:text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                  whileHover={isSubmitting ? {} : { scale: 1.05 }}
                  whileTap={isSubmitting ? {} : { scale: 0.98 }}
                >
                  <span>{isSubmitting ? 'Sending...' : 'Subscribe'}</span>
                  <ArrowRight className={`w-4 h-4 ${isSubmitting ? '' : 'group-hover:translate-x-1 transition-transform duration-200'}`} />
                </motion.button>
              </form>
              <AnimatePresence mode="wait">
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`text-xs p-3 rounded-xl border max-w-sm mx-auto lg:ml-auto ${
                      message.type === 'error' 
                        ? 'bg-red-50/50 text-red-700 border-red-200/50' 
                        : 'bg-green-50/50 text-green-700 border-green-200/50'
                    }`}
                    role="alert"
                    aria-live="polite"
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 border-t border-border/30 text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            &copy; {currentYear} RBTechTalks. All rights reserved. | Built with ❤️ for the dev community.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;