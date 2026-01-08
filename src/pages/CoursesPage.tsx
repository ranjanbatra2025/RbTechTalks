import {
  BookOpen, Users, Clock, Star, ArrowRight, CheckCircle, Lock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabaseClient";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

/* -------------------- UTIL -------------------- */
const formatPrice = (price: number) =>
  price === 0 ? "Free" : `$${price}`;

/* -------------------- COMPONENT -------------------- */
export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("id");
      if (error) throw error;
      return data;
    }
  });

  const handleEnroll = async (course: any) => {
    if (!user) {
      navigate(`/login?redirect=/courses/${course.id}`);
      return;
    }

    setLoadingId(course.id);

    try {
      if (course.price === 0) {
        const { data: existing } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .maybeSingle();

        if (existing) {
          navigate(`/courses/${course.id}`);
          return;
        }

        await supabase
          .from("enrollments")
          .insert({ user_id: user.id, course_id: course.id });

        navigate(`/courses/${course.id}`);
      } else {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              courseId: course.id,
              userId: user.id,
            }),
          }
        );

        const { url } = await res.json();
        window.location.href = url;
      }
    } finally {
      setLoadingId(null);
    }
  };

  /* -------------------- STATES -------------------- */
  if (isLoading) {
    return (
      <section className="py-20 container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-96 bg-white/5 animate-pulse rounded-xl" />
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <p className="text-center py-20 text-red-500">
        Failed to load courses.
      </p>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        No courses available yet.
      </p>
    );
  }

  /* -------------------- RENDER -------------------- */
  return (
    <section className="py-20 container mx-auto px-4">
      <header className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">
          All <span className="glow-text">Courses</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Learn modern skills with production-grade, project-driven courses.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course: any) => (
          <div
            key={course.id}
            onClick={() => navigate(`/courses/${course.id}`)}
            className="group cursor-pointer tech-card overflow-hidden relative"
          >
            {course.featured && (
              <span className="absolute top-4 left-4 z-10 text-xs bg-primary text-white px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <img
              src={course.image_url}
              alt={course.title}
              className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
            />

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm px-3 py-1 bg-accent/10 rounded-full">
                  {course.level}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {course.rating}
                </span>
              </div>

              <h3 className="text-xl font-semibold group-hover:text-primary">
                {course.title}
              </h3>

              <p className="text-muted-foreground line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} /> {course.students}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(course.price)}
                  </span>
                  {course.original_price && (
                    <span className="ml-2 text-sm line-through text-muted-foreground">
                      ${course.original_price}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnroll(course);
                  }}
                  disabled={loadingId === course.id}
                  className="btn-accent flex items-center gap-2"
                >
                  {course.price === 0 ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Lock size={16} />
                  )}
                  {loadingId === course.id ? "Processing..." : "Start"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
