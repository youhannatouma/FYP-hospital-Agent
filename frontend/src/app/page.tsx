import { Navbar } from "@/components/navbar"
import { FloatingAvatar } from "@/components/floating-avatar"
import { 
  HeroSection, 
  FeaturesSection, 
  DoctorsSection, 
  AISection, 
  ArchitectureSection, 
  TechStackSection, 
  RoadmapSection, 
  SecuritySection, 
  FooterSection 
} from "@/components/landing/LandingSections"

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
