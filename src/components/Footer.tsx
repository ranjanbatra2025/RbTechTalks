// Footer.tsx
import { Code, Youtube, Github, Twitter, Linkedin, Mail, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../utils/supabaseClient';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "YouTube", icon: Youtube, href: "https://youtube.com", color: "hover:text-red-500" },
    { name: "GitHub", icon: Github, href: "https://github.com", color: "hover:text-gray-300 dark:hover:text-gray-400" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:text-sky-400" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com", color: "hover:text-blue-600" },
    { name: "Email", icon: Mail, href: "mailto:hello@rbtechtalks.com", color: "hover:text-primary" },
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

      const { error: upsertError } = await supabase
        .from('newsletter')
        .upsert([{ email: emailTrimmed }], { onConflict: 'email' });

      if (upsertError) throw upsertError;

      const { data: row, error: fetchError } = await supabase
        .from('newsletter')
        .select('email, unsubscribe_token')
        .eq('email', emailTrimmed)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!row) throw new Error('Failed to create subscription');

      const FUNCTIONS_DOMAIN = 'https://vvjaqiowlgkabmchvmhi.functions.supabase.co';
      const confirmUrl = `${FUNCTIONS_DOMAIN}/confirm-subscription?token=${row.unsubscribe_token}`;
      const unsubscribeUrl = `${FUNCTIONS_DOMAIN}/unsubscribe?token=${row.unsubscribe_token}`;

      const body = {
        to: emailTrimmed,
        subject: 'Confirm your RBTechTalks subscription',
        html: `<p>Thanks for subscribing to RBTechTalks!</p>
               <p><a href="${confirmUrl}">Click here to confirm your subscription</a></p>
               <p>If you didn’t sign up, you can <a href="${unsubscribeUrl}">unsubscribe here</a>.</p>`,
        text: `Confirm: ${confirmUrl}\nUnsubscribe: ${unsubscribeUrl}`
      };

      const res = await supabase.functions.invoke('send-email', { body });

      if (res.error || (res.data && res.data.error)) {
        throw res.error || new Error(res.data.error);
      }

      setMessage({
        type: 'success',
        text: 'Subscribed! Please check your inbox to confirm.',
      });
      setEmail('');
    } catch (error) {
      console.error('Newsletter error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-card border-t border-border transition-all duration-300 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand + Socials + Newsletter */}
        <div className="py-8 md:py-10 space-y-8 md:space-y-12">
          {/* Brand & Socials */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0"
          >
            <div className="space-y-4 flex-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  RBTechTalks
                </span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
                Empowering developers with premium tutorials, courses, and cutting-edge tech insights.
              </p>
            </div>
            <div className="flex space-x-3">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg bg-background/50 border border-border/30 ${social.color} transition-all duration-200 hover:bg-primary/5 hover:border-primary/20 hover:shadow-md`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Centered Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center space-y-4 max-w-md mx-auto"
          >
            <h4 className="font-semibold mb-3 text-sm text-foreground">Stay Updated</h4>
            <p className="text-muted-foreground text-xs mb-4">
              Latest tech insights delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 rounded-lg bg-background border-2 border-border/30 dark:border-border/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs text-foreground placeholder:text-muted-foreground shadow-sm dark:shadow-md"
              />
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-sm ${
                  isSubmitting
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-md hover:scale-105'
                }`}
                whileHover={isSubmitting ? {} : { scale: 1.02 }}
                whileTap={isSubmitting ? {} : { scale: 0.98 }}
              >
                {isSubmitting ? '...' : 'Subscribe'}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Newsletter Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`mx-auto max-w-sm px-3 py-2 rounded-lg border text-xs text-center transition-colors duration-200 shadow-sm ${
                message.type === 'success'
                  ? 'bg-green-50/80 dark:bg-green-900/80 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-700/50'
                  : 'bg-red-50/80 dark:bg-red-900/80 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-700/50'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Copyright */}
        <div className="py-4 border-t border-border/20 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xs text-muted-foreground transition-colors"
          >
            © {currentYear} RBTechTalks. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;