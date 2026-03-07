import { Navbar } from "@/components/navbar"
import { FloatingAvatar } from "@/components/floating-avatar"
import { HeroSection } from "@/components/landing/LandingSections"
import { LandingIntroClient } from "../components/intro/LandingIntroClient"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { DoctorsSection } from "@/components/landing/DoctorsSection"
import { AISection } from "@/components/landing/AISection"
import { DoctorInteractionSection } from "@/components/landing/DoctorInteractionSection"
import { ProductPreviewSection } from "@/components/landing/ProductPreviewSection"
import { ArchitectureSection } from "@/components/landing/ArchitectureSection"
import { TechStackSection } from "@/components/landing/TechStackSection"
import { RoadmapSection } from "@/components/landing/RoadmapSection"
import { TrustSection } from "@/components/landing/TrustSection"
import { FooterSection } from "@/components/landing/FooterSection"

export default function Page() {
  return (
    <LandingIntroClient>
      <main className="min-h-screen">
        <Navbar />
        <FloatingAvatar />
        <HeroSection />
        <FeaturesSection />
        <DoctorsSection />
        <AISection />
        <DoctorInteractionSection />
        <ProductPreviewSection />
        <ArchitectureSection />
        <TechStackSection />
        <RoadmapSection />
        <TrustSection />
        <FooterSection />
      </main>
    </LandingIntroClient>
  )
}
