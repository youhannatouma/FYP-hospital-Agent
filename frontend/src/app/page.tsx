import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { FloatingAvatar } from "@/components/floating-avatar"
import { HeroSection } from "@/components/landing/LandingSections"
import { LandingIntroClient } from "../components/intro/LandingIntroClient"

// Dynamically import heavy sections below the fold
const FeaturesSection = dynamic(() => import("@/components/landing/FeaturesSection").then(m => m.FeaturesSection))
const DoctorsSection = dynamic(() => import("@/components/landing/DoctorsSection").then(m => m.DoctorsSection))
const AISection = dynamic(() => import("@/components/landing/AISection").then(m => m.AISection))
const DoctorInteractionSection = dynamic(() => import("@/components/landing/DoctorInteractionSection").then(m => m.DoctorInteractionSection))
const ProductPreviewSection = dynamic(() => import("@/components/landing/ProductPreviewSection").then(m => m.ProductPreviewSection))
const ArchitectureSection = dynamic(() => import("@/components/landing/ArchitectureSection").then(m => m.ArchitectureSection))
const TechStackSection = dynamic(() => import("@/components/landing/TechStackSection").then(m => m.TechStackSection))
const RoadmapSection = dynamic(() => import("@/components/landing/RoadmapSection").then(m => m.RoadmapSection))
const TrustSection = dynamic(() => import("@/components/landing/TrustSection").then(m => m.TrustSection))
const FooterSection = dynamic(() => import("@/components/landing/FooterSection").then(m => m.FooterSection))

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
