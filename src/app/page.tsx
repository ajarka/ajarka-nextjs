import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { FAQSection } from "@/components/home/faq-section"
import { SignUpMentorSection } from "@/components/home/signup-mentor-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <SignUpMentorSection />
      <TestimonialsSection />
      <FAQSection />
    </>
  )
}
