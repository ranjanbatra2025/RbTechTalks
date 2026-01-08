import { useState, useEffect } from "react";
import { 
  Menu, X, Code, Play, BookOpen, User, LogIn, LogOut, 
  ChevronDown, User as UserIcon, Sun, Moon, Rocket, Settings, CreditCard, Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/utils/supabaseClient"; // Adjust path if needed (same as in LoginPage)

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Real auth state from Supabase
  const [session, setSession] = useState<any>(null);

  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Listen to Supabase auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes (login, logout, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  const navItems = [
    { name: "Blog", to: "/blog", icon: Code },
    { name: "Videos", to: "/videos", icon: Play },
    { name: "Courses", to: "/courses", icon: BookOpen },
    { name: "Venture Studio", to: "/venture-studio", icon: Rocket, badge: "New" },
    { name: "About", to: "/about", icon: User },
  ];

  // Derive user info from real session
  const isLoggedIn = !!session;
  const userEmail = session?.user?.email || '';
  const displayName = userEmail ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1) : 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setIsMenuOpen(false);
    await supabase.auth.signOut();
    // Session will update automatically via listener
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isScrolled 
            ? "h-16 bg-zinc-950/80 backdrop-blur-xl backdrop-saturate-150 border-b border-white/5 shadow-lg shadow-black/5" 
            : "h-20 bg-transparent"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* --- LOGO SECTION --- */}
            <Link 
              to="/" 
              className="flex items-center space-x-2.5 group relative z-50 focus:outline-none"
            >
              <div className="relative w-9 h-9 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-md ring-1 ring-white/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 opacity-100" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <Code className="w-5 h-5 text-white relative z-10 drop-shadow-sm" strokeWidth={2.5} />
              </div>

              <span className="text-xl font-bold tracking-tight flex flex-col leading-none">
                <span className="flex items-center gap-0.5">
                  <span className="text-white drop-shadow-md">RBTech</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm filter brightness-110">
                    Talks
                  </span>
                </span>
              </span>
            </Link>

            {/* --- DESKTOP NAVIGATION --- */}
            <nav className="hidden md:flex items-center justify-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                const textColor = isScrolled 
                  ? (isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200")
                  : (isActive ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200");

                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group ${textColor}`}
                  >
                    <span className={`absolute inset-0 rounded-full transition-all duration-300 
                      ${isScrolled 
                        ? "bg-white/10" 
                        : "bg-zinc-100 dark:bg-zinc-800/50"
                      }
                      ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"}`} 
                    />
                    
                    <span className="relative z-10 flex items-center space-x-1.5">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="flex h-4 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-1.5 text-[9px] font-bold text-white shadow-sm ring-1 ring-inset ring-white/20">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* --- ACTIONS SECTION --- */}
            <div className="flex items-center space-x-2 sm:space-x-4 relative z-50">
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`relative group p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                  ${isScrolled 
                    ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/10" 
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform duration-500 group-hover:-rotate-12" />
                )}
              </button>

              {/* Divider */}
              <div className={`h-5 w-px hidden md:block ${isScrolled ? "bg-white/10" : "bg-zinc-200 dark:bg-zinc-800"}`} />

              <div className="hidden md:flex items-center space-x-3">
                {isLoggedIn ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all duration-200 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500/20
                        ${isScrolled 
                          ? "border-white/10 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-200" 
                          : "border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800"
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/20">
                        {userInitial}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Desktop Dropdown */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 p-1.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-3 mb-1 border-b border-zinc-100 dark:border-zinc-800/50">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</p>
                          <p className="text-xs text-zinc-500">Free Plan • <Link to="/upgrade" className="text-indigo-600 hover:underline">Upgrade</Link></p>
                        </div>
                        <div className="space-y-0.5">
                          {[
                            { name: "Profile", icon: User, to: "/profile" },
                            { name: "Settings", icon: Settings, to: "/settings" },
                            { name: "Billing", icon: CreditCard, to: "/billing" },
                          ].map((item) => (
                            <Link key={item.name} to={item.to} className="flex items-center w-full px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                              <item.icon className="w-4 h-4 mr-3" /> {item.name}
                            </Link>
                          ))}
                        </div>
                        <div className="mt-1 pt-1 border-t border-zinc-100 dark:border-zinc-800/50">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" /> Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Real redirect to login page */}
                    <Link 
                      to="/login"
                      className={`text-sm font-semibold px-4 py-2 transition-colors
                        ${isScrolled 
                          ? "text-zinc-300 hover:text-white" 
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className={`group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full px-6 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${isScrolled 
                          ? "bg-white text-zinc-950 hover:bg-zinc-200 focus:ring-white focus:ring-offset-zinc-950" 
                          : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-500/20 dark:shadow-none focus:ring-zinc-400 dark:focus:ring-offset-zinc-900"
                        }`}
                    >
                      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                        <div className="relative h-full w-8 bg-white/20 dark:bg-black/10" />
                      </div>
                      <span className="flex items-center text-sm">
                        Get Started <Sparkles className="w-3.5 h-3.5 ml-2 opacity-70" />
                      </span>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className={`md:hidden relative p-2 rounded-xl transition-colors focus:outline-none
                  ${isScrolled 
                    ? "text-zinc-300 hover:bg-white/10" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE DRAWER --- */}
      <div 
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
        ${isMenuOpen ? "visible" : "invisible delay-300"}`}
      >
        <div 
          className={`absolute inset-0 bg-zinc-900/20 dark:bg-black/40 backdrop-blur-sm transition-opacity duration-500
          ${isMenuOpen ? "opacity-100" : "opacity-0"}`} 
          onClick={() => setIsMenuOpen(false)} 
        />
        
        <div 
          className={`absolute top-0 right-0 w-full max-w-xs h-[100dvh] bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-l border-zinc-200 dark:border-zinc-800
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800/50">
              <span className="font-bold text-lg text-zinc-900 dark:text-white">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center justify-between px-4 py-3.5 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>
            
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
              {isLoggedIn ? (
                <div className="space-y-4">
                   <div className="flex items-center space-x-3 px-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                        {userInitial}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{displayName}</p>
                        <p className="text-xs text-zinc-500">{userEmail}</p>
                      </div>
                   </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:bg-white dark:hover:bg-zinc-800 hover:text-red-600 transition-all shadow-sm"
                  >
                    <LogOut className="w-4 h-4" /> <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex justify-center items-center px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex justify-center items-center px-4 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold shadow-lg shadow-zinc-900/10 hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;