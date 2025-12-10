import { ArrowRight, Play, BookOpen, Code } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="RBTechTalks Hero Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center fade-in">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 fade-in-delay">
            <Code className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Tech Content Creator</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to{" "}
            <span className="glow-text">RBTechTalks</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Dive deep into the world of technology with comprehensive blog posts, 
            engaging videos, and structured courses designed to elevate your tech skills.
          </p>

          {/* CTA Buttons - Hidden via Tailwind 'hidden' class */}
          <div className="hidden flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="btn-hero group">
              <span>Explore Content</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-ghost group">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              <span>Watch Latest Video</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Blog Posts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">25+</div>
              <div className="text-muted-foreground">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-glow mb-2">10+</div>
              <div className="text-muted-foreground">Courses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;