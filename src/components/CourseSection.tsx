import { BookOpen, Users, Clock, Star, ArrowRight, CheckCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../utils/supabaseClient"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"   // 👈 make sure this file exists as we discussed

const CourseSection = () => {
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: courses = [], error, isLoading } = useQuery({
    queryKey: ["courses", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("id", { ascending: true })
      if (error) throw error
      return data
    },
  })

  const handleEnroll = async (courseId: number) => {
    // Guard: Ensure course exists in loaded data
    const course = courses.find(c => c.id === courseId)
    if (!course) {
      alert("Course not found. Please refresh and try again.")
      return
    }

    // 🔐 If not logged in, send to login page with redirect back to courses
    if (!user) {
      const redirect = `/courses?courseId=${courseId}`
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
      return
    }

    setLoadingId(courseId)

    try {
      const userId = user.id
      const payload = { courseId, userId }
      console.log("Enrollment payload:", payload) // 👈 Log for debugging

      const apiUrl = `${import.meta.env.VITE_API_URL}/create-checkout-session`
      console.log("Fetching:", apiUrl)

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          const errorText = await response.text()
          errorData = { error: errorText }
        }
        console.error("API Error:", response.status, errorData) // 👈 Structured logging
        throw new Error(`Payment init failed: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const { url } = await response.json()
      if (!url) throw new Error("No checkout URL returned")

      window.location.href = url
    } catch (err: any) {
      console.error("Enroll error:", err)
      alert(`Failed to enroll: ${err.message}. Check console for details.`)
    } finally {
      setLoadingId(null)
    }
  }

  if (isLoading) {
    return (
      <section id="courses" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-muted-foreground">Loading courses...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="courses" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-red-500">
            Failed to load courses: {(error as Error).message}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="courses" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="glow-text">Courses</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive courses designed to take your skills to the next level with practical projects
          </p>
        </div>

        <div className="content-grid">
          {courses.map((course: any) => (
            <div
              key={course.id}
              className={`tech-card overflow-hidden group cursor-pointer relative ${
                course.featured ? "ring-2 ring-primary/50" : ""
              }`}
            >
              {course.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="relative overflow-hidden">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    {course.level}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
                  {course.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                <div className="space-y-2">
                  {course.features?.map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
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
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">
                      {course.price}
                    </span>
                    {course.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {course.original_price}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={loadingId === course.id || !user}  // 👈 Disable if not logged in
                    className="btn-accent group flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>
                      {loadingId === course.id ? "Processing..." : user ? "Enroll" : "Log in to Enroll"}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/courses" className="btn-ghost group">
            <span>View All Courses</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CourseSection