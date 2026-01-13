// src/components/CourseSection.tsx
import { BookOpen, Users, Clock, Star, ArrowRight, CheckCircle } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../utils/supabaseClient"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"

const CourseSection = () => {
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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

  // Fetch all enrolled course IDs for the current user (efficient single query)
  const { data: enrolledCourseIds = [] } = useQuery({
    queryKey: ["userEnrollments", user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id)
      if (error) throw error
      return data?.map((e: any) => e.course_id) || []
    },
    enabled: !!user,
  })

  // Auto-enroll if user just logged in to enroll in a specific course
  useEffect(() => {
    if (!user || isLoading || courses.length === 0) return

    const pendingIdStr = localStorage.getItem("pending_enroll_course_id")
    if (!pendingIdStr) return

    const pendingId = Number(pendingIdStr)
    if (isNaN(pendingId)) {
      localStorage.removeItem("pending_enroll_course_id")
      return
    }

    // Only proceed if the course exists in the current list
    if (courses.some((c: any) => c.id === pendingId)) {
      handleEnroll(pendingId, true)
      localStorage.removeItem("pending_enroll_course_id")
    }
  }, [user, isLoading, courses])

  const handleEnroll = async (courseId: number, viaRedirect: boolean = false) => {
    const course = courses.find((c: any) => c.id === courseId)
    if (!course) {
      alert("Course not found. Please refresh the page.")
      return
    }

    if (!user) {
      // Store pending enrollment and redirect to login, returning to the current page
      localStorage.setItem("pending_enroll_course_id", String(courseId))
      const returnTo = `${location.pathname}${location.search}`
      navigate(`/login?redirect=${encodeURIComponent(returnTo)}`)
      return
    }

    setLoadingId(courseId)

    try {
      const userId = user.id

      if (course.price === 0) {
        // Free course: Direct enrollment
        const { data: existing, error: checkError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle()

        if (checkError) throw checkError
        if (existing) {
          alert('You are already enrolled in this course.')
          setLoadingId(null)
          return
        }

        const { error: insertError } = await supabase
          .from('enrollments')
          .insert({ 
            user_id: userId, 
            course_id: courseId,
            via_login_redirect: viaRedirect   // ← NEW: Track if enrollment came via login redirect
          })

        if (insertError) throw insertError

        // Update student count
        await supabase
          .from('courses')
          .update({ students: course.students + 1 })
          .eq('id', courseId)

        alert('Enrolled successfully! Redirecting to your course...')
        navigate(`/courses/${courseId}`)
      } else {
        // Paid course: Stripe
        const payload = { 
          courseId, 
          userId,
          viaRedirect   // ← NEW: Pass flag to backend so webhook can record it
        }
        const apiUrl = `${import.meta.env.VITE_API_URL}/create-checkout-session`
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          let errorMessage = `Server error: ${response.status}`;
          try {
            const errorJson = await response.json();
            errorMessage = errorJson.error || errorMessage;
          } catch {
            try {
              const errorText = await response.text();
              errorMessage = errorText || errorMessage;
            } catch {}
          }
          throw new Error(errorMessage);
        }

        const { url } = await response.json()
        if (!url) throw new Error("Invalid response: No checkout URL provided.")
        
        window.location.href = url
      }

    } catch (err: any) {
      console.error("Enrollment Failed:", err)
      alert(`Enrollment failed: ${err.message}. Please try again or contact support.`)
    } finally {
      setLoadingId(null)
    }
  }

  // ... rest of the component (loading/error/render) remains exactly the same
  if (isLoading) {
    return (
      <section id="courses" className="py-24 bg-background min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xl text-muted-foreground font-medium animate-pulse">Loading premium courses...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="courses" className="py-24 bg-background flex items-center justify-center">
        <div className="text-center max-w-lg px-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Unable to Load Courses</h3>
          <p className="text-muted-foreground mb-6">
            {(error as Error).message || "Something went wrong while fetching data."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="courses" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Background Elements for Depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            <Star className="w-4 h-4 mr-2 fill-current" /> 
            World-Class Learning
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Featured <span className="glow-text">Masterclasses</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Project-based curriculums designed to take you from beginner to industry-ready expert.
          </p>
        </div>

        <div className="content-grid">
          {courses.map((course: any) => {
            const isEnrolled = user && enrolledCourseIds.includes(course.id)
            const isLoadingThis = loadingId === course.id

            return (
              <div
                key={course.id}
                className={`tech-card group relative flex flex-col h-full ${
                  course.featured ? "ring-1 ring-primary/50 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]" : ""
                }`}
              >
                {course.featured && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 bg-primary text-white shadow-lg shadow-primary/25 rounded-full text-xs font-bold uppercase tracking-wider">
                      Best Seller
                    </span>
                  </div>
                )}
                
                {/* Clickable Image → Opens course detail */}
                <Link to={`/courses/${course.id}`}>
                  <div className="relative overflow-hidden aspect-video rounded-t-xl bg-muted cursor-pointer">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col flex-grow relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      course.level === 'Beginner' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      course.level === 'Intermediate' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}>
                      {course.level}
                    </span>
                    <div className="flex items-center space-x-1 bg-yellow-400/10 px-2 py-1 rounded text-yellow-600 dark:text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold">{course.rating}</span>
                    </div>
                  </div>

                  {/* Clickable Title → Opens course detail */}
                  <Link to={`/courses/${course.id}`}>
                    <h3 className="text-2xl font-bold mb-3 text-card-foreground hover:text-primary transition-colors leading-tight cursor-pointer">
                      {course.title}
                    </h3>
                  </Link>
                  
                  <p className="text-muted-foreground line-clamp-2 mb-6 text-sm leading-relaxed">
                    {course.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-3 mb-8 flex-grow">
                    {course.features?.slice(0, 3).map((feature: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 text-sm group/feature">
                        <CheckCircle className="w-5 h-5 text-primary/70 mt-0.5 group-hover/feature:text-primary transition-colors" />
                        <span className="text-muted-foreground group-hover/feature:text-foreground transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground py-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{Number(course.students).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Dynamic Action Button */}
                  <div className="flex items-center justify-between pt-4 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-3xl font-extrabold text-foreground tracking-tight">
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </span>
                      {course.original_price && (
                        <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                          ${course.original_price}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        if (isEnrolled) {
                          navigate(`/courses/${course.id}`)
                        } else {
                          handleEnroll(course.id)
                        }
                      }}
                      disabled={isLoadingThis}
                      className="btn-accent group relative px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isLoadingThis ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {!user ? "Login to Join" : isEnrolled ? "View Course" : "Enroll Now"}
                            </span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-20">
          <Link to="/courses" className="btn-ghost inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg group">
            <span>Explore Full Catalog</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CourseSection