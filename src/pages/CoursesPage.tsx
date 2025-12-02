import { BookOpen, Users, Clock, Star, ArrowRight, CheckCircle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

const CoursesPage = () => {
  const { data: courses = [], error, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-red-500">Failed to load courses: {error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            All <span className="glow-text">Courses</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive courses designed to take your skills to the next level with practical projects
          </p>
        </div>

        {/* Course Grid */}
        <div className="content-grid">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className={`tech-card overflow-hidden group cursor-pointer relative ${
                course.featured ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              {/* Featured Badge */}
              {course.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Course Image */}
              <div className="relative overflow-hidden">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Course Content */}
              <div className="p-6 space-y-4">
                {/* Level Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    {course.level}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground line-clamp-2">
                  {course.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {course.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-card-border">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">{course.price}</span>
                    {course.original_price && (
                      <span className="text-sm text-muted-foreground line-through">{course.original_price}</span>
                    )}
                  </div>
                  <button className="btn-accent group flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>Enroll</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesPage;