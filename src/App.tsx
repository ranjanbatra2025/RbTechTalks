import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Home from "@/pages/Home"
import BlogPage from "@/pages/BlogPage"
import BlogDetail from "@/pages/BlogDetail"
import VideosPage from "@/pages/VideosPage"
import VideoDetail from "@/pages/VideoDetail"
import CoursesPage from "@/pages/CoursesPage"
import AboutPage from "@/pages/AboutPage"
import SignUpPage from "@/pages/SignUpPage"
import LoginPage from "@/pages/LoginPage"
import WaitlistPage from "@/pages/WaitlistPage" // 👈 Add this import for the waitlist route

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/waitlist" element={<WaitlistPage />} /> {/* 👈 Add this route to fix 404 */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/videos/:id" element={<VideoDetail />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App