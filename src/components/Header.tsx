// components/Header.tsx - Updated with Venture Studio Tab
import { useState } from "react";
import { 
  Menu, X, Code, Play, BookOpen, User, LogIn, LogOut, 
  ChevronDown, User as UserIcon, Sun, Moon, Rocket 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: "John Doe", avatar: "" }); 
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: "Blog", to: "/blog", icon: Code },
    { name: "Videos", to: "/videos", icon: Play },
    { name: "Courses", to: "/courses", icon: BookOpen },
    { name: "Venture Studio", to: "/venture-studio", icon: Rocket }, // 👈 Added Venture Studio
    { name: "About", to: "/about", icon: User },
  ];

  const handleLogin = () => {
    console.log("Login clicked");
    setIsLoggedIn(true);
    setUser({ name: "John Doe", avatar: "" });
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    setIsLoggedIn(false);
    setUser(null);
    setUserDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer transition-all duration-200 hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              RBTechTalks
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-300 group hover:scale-105"
              >
                <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section & Mobile Theme Toggle + Menu */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-all duration-200 group"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-muted"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <UserIcon className="w-6 h-6" />
                    )}
                    <span className="text-sm font-medium hidden lg:block">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border/50 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 border border-border/50 rounded-lg hover:border-primary/30"
                  >
                    Login
                  </button>
                  <Link
                    to="/signup"
                    className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 bg-background/80 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-all duration-200 p-3 rounded-lg hover:bg-muted group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <span className="text-base">{item.name}</span>
                </Link>
              ))}
              {isLoggedIn ? (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center space-x-3 p-3 text-sm text-muted-foreground">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <UserIcon className="w-6 h-6" />
                    )}
                    <span>{user.name}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors rounded-lg w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors border border-border/50 rounded-lg hover:border-primary/30"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                  <Link
                    to="/signup"
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Get Started</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;