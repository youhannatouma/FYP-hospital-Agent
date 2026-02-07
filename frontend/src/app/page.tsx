import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { DoctorsSection } from "@/components/doctors-section"
import { AISection } from "@/components/ai-section"
import { ArchitectureSection } from "@/components/architecture-section"
import { TechStackSection } from "@/components/tech-stack-section"
import { RoadmapSection } from "@/components/roadmap-section"
import { SecuritySection } from "@/components/security-section"
import { FooterSection } from "@/components/footer-section"
import { FloatingAvatar } from "@/components/floating-avatar"

export default function Page() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <FloatingAvatar />
      <HeroSection />
      <FeaturesSection />
      <DoctorsSection />
      <AISection />
      <ArchitectureSection />
      <TechStackSection />
      <RoadmapSection />
      <SecuritySection />
      <FooterSection />
    </main>
  )
}
