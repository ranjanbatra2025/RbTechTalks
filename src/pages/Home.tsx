import Hero from "@/components/Hero";
import BlogSection from "@/components/BlogSection";
import CourseSection from "@/components/CourseSection";
import VideoSection from "@/components/VideoSection";
import WaitlistSection from "@/components/WaitlistSection"; // New import

const Home = () => {
  return (
    <>
      <Hero />
      <BlogSection />
      <CourseSection />
      <VideoSection />
      <WaitlistSection /> {/* New: Dedicated waitlist section for high conversion */}
    </>
  );
};

export default Home;