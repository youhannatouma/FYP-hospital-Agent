"use client"

import Link from "next/link"
import { 
  ArrowRight, Bot, Mic, MessageCircle, Shield, Users, Star,
  Heart, Stethoscope, Brain, Pill, FileText, CalendarCheck,
  Ambulance, Hospital, Thermometer, Syringe,
  CheckCircle2, Circle, Clock,
  Lock, Eye, Award,
  Search, Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

// --- Hero Section ---
export function HeroSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)

  return (
    <section id="home" ref={ref} className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 mesh-gradient">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 right-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[120px] dark:opacity-50" />
        <div className="absolute bottom-20 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px] dark:opacity-30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:gap-20">
          <div className={`flex max-w-2xl flex-1 flex-col items-center text-center lg:items-start lg:text-left transition-all duration-700 ease-out ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
            <div className="mb-8 flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 shadow-sm">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-xs font-bold text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">260k+ Patients</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                  ))}
                  <span className="text-xs text-muted-foreground">Trust Us</span>
                </div>
              </div>
            </div>

            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl font-heading">
              {"Your Family's Care,"}<br />
              <span className="text-primary">Our AI-Powered</span> Mission
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              From pediatrics to geriatrics, our integrated healthcare system ensures seamless support throughout life's journey with intelligent AI assistance.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 text-base">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 border-border text-foreground px-8 text-base bg-transparent">
                <Mic className="h-4 w-4" />
                Talk to AI
              </Button>
            </div>

            <div className="mt-12 grid w-full grid-cols-3 gap-8 border-t border-border pt-8">
              {[{ value: "50+", label: "Specialties" }, { value: "24/7", label: "AI Support" }, { value: "98%", label: "Satisfaction" }].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`relative flex-shrink-0 transition-all duration-700 delay-200 ease-out ${isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
            <div className="relative w-80 sm:w-96">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">AI Voice Assistant</h3>
                    <p className="text-sm text-muted-foreground">Always ready to help</p>
                  </div>
                  <div className="ml-auto h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="self-end rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">I have a headache and fever</div>
                  <div className="self-start rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-foreground">
                    {"I'll help you assess your symptoms. How long have you been experiencing this?"}
                  </div>
                  <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Type or speak...</span>
                  <Mic className="ml-auto h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="animate-float absolute -right-4 -bottom-4 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs font-semibold text-card-foreground">HIPAA Compliant</div>
                    <div className="text-xs text-muted-foreground">Your data is secure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Features Section ---
const features = [
  { icon: Bot, title: "AI Healthcare Assistant", description: "24/7 intelligent medical Q&A with symptom analysis, first aid guidance, and medication inquiries.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Search, title: "Doctor Discovery", description: "AI-powered doctor matching based on symptoms, with ratings, reviews, and virtual clinic tours.", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10" },
  { icon: Pill, title: "Pharmacy Assistant", description: "Search medicines, check local pharmacy availability, compare prices, and find alternatives.", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: FileText, title: "Report Analysis", description: "Upload and analyze medical reports with AI-powered insights and plain language explanations.", color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10" },
  { icon: CalendarCheck, title: "Appointment Booking", description: "Real-time availability, AI-suggested optimal times, video or in-person options with reminders.", color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10" },
  { icon: Stethoscope, title: "Symptom Checker", description: "AI-powered symptom analysis with triage recommendations and specialist referrals.", color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-500/10" },
]

export function FeaturesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)

  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Core Features</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Everything You Need for Better Care</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">A comprehensive suite of AI-powered tools designed to simplify your care experience from start to finish.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          {features.map((feature, i) => (
            <div key={feature.title} className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Doctors Section ---
const doctorsList = [
  { name: "Dr. Sarah Mitchell", specialty: "Cardiology", rating: 4.9, reviews: 234, location: "New York, NY", availability: "Available Today", initials: "SM" },
  { name: "Dr. James Chen", specialty: "Neurology", rating: 4.8, reviews: 189, location: "San Francisco, CA", availability: "Next: Tomorrow", initials: "JC" },
  { name: "Dr. Emily Rodriguez", specialty: "Pediatrics", rating: 4.9, reviews: 312, location: "Austin, TX", availability: "Available Today", initials: "ER" },
  { name: "Dr. Michael Park", specialty: "Dermatology", rating: 4.7, reviews: 156, location: "Chicago, IL", availability: "Next: Wed", initials: "MP" },
]

export function DoctorsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)

  return (
    <section id="doctors" className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Find Your Doctor</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Top-Rated Specialists Near You</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">Browse our network of verified healthcare professionals. Sign up to book appointments and access full profiles.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          {doctorsList.map((doc) => (
            <div key={doc.name} className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{doc.initials}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-card-foreground">{doc.name}</h3>
                  <p className="text-xs text-primary">{doc.specialty}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-medium text-card-foreground">{doc.rating}</span>
                  <span className="text-xs text-muted-foreground">({doc.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{doc.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{doc.availability}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full border-border text-foreground bg-transparent">View Profile</Button>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/sign-up">
            <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
              Sign up to see all doctors
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function MapPin(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  )
}

// --- AI Section ---
const aiCapabilities = [
  { icon: MessageCircle, title: "Chat Assistant", description: "Have a conversation with our AI assistant anytime. Discuss symptoms, medications, and get instant guidance." },
  { icon: Mic, title: "Voice Interaction", description: "Speak naturally with our AI. Perfect for accessibility and hands-free healthcare navigation." },
  { icon: Brain, title: "Symptom Analysis", description: "Advanced AI-powered symptom analysis with triage recommendations and specialist matching." },
  { icon: Heart, title: "Mental Health", description: "AI-powered emotion analysis, mood tracking, mental health assessments, and therapist matching." },
  { icon: Camera, title: "Visual Analysis", description: "Upload images for AI-assisted visual analysis. Skin conditions, medication identification, and more." },
  { icon: ShieldCheck, title: "Report Interpretation", description: "Get plain language explanations of lab results and medical reports powered by medical AI." },
]

function Camera(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
  )
}

function ShieldCheck(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
  )
}

export function AISection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)

  return (
    <section id="ai" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">AI-Powered Care</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Your Personal Care Navigator</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">Experience the future of healthcare with our intelligent AI assistant. Whether you prefer typing or talking, get instant help finding doctors, booking appointments, and navigating your needs.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          {aiCapabilities.map((cap) => (
            <div key={cap.title} className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <cap.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">{cap.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{cap.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center gap-4">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
            <MessageCircle className="h-4 w-4" /> Try AI Chat
          </Button>
          <Button size="lg" variant="outline" className="gap-2 border-border text-foreground px-8 bg-transparent">
            <Mic className="h-4 w-4" /> Try Voice
          </Button>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">Guest users get 3 free symptom checks. Sign up for unlimited access.</p>
      </div>
    </section>
  )
}

// --- Architecture Section ---
const departments = [
  { icon: Heart, title: "Cardiology Center", color: "text-rose-500 dark:text-rose-400", borderColor: "border-rose-500/30", bg: "bg-rose-500/10", items: ["ECG & Echocardiography", "Cardiac Catheterization", "Heart Failure Management", "Arrhythmia Monitoring"] },
  { icon: Brain, title: "Neurology & Psychiatry", color: "text-indigo-500 dark:text-indigo-400", borderColor: "border-indigo-500/30", bg: "bg-indigo-500/10", items: ["EEG & Brain Mapping", "Stroke Rapid Response", "Cognitive Behavioral Therapy", "Sleep Disorder Clinic"] },
  { icon: Stethoscope, title: "Primary & Family Care", color: "text-primary", borderColor: "border-primary/30", bg: "bg-primary/10", items: ["Annual Health Screenings", "Chronic Disease Management", "Immunization Programs", "Pediatric Well-Child Visits"] },
  { icon: Pill, title: "Pharmacy & Lab Services", color: "text-orange-500 dark:text-orange-400", borderColor: "border-orange-500/30", bg: "bg-orange-500/10", items: ["In-House Pharmacy", "Blood Work & Pathology", "Drug Interaction Screening", "Personalized Medication Plans"] },
]

const quickStats = [
  { icon: Ambulance, label: "Emergency Care 24/7" },
  { icon: Hospital, label: "120+ Bed Capacity" },
  { icon: Thermometer, label: "Same-Day Test Results" },
  { icon: Syringe, label: "Vaccination Center" },
]

export function ArchitectureSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation(0.2)

  return (
    <section id="architecture" className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Our Departments</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Comprehensive Medical Specialties</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">From preventive screenings to complex surgeries, our departments work together to deliver integrated, patient-centered care.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          {departments.map((dept) => (
            <div key={dept.title} className={`rounded-2xl border bg-card p-6 ${dept.borderColor}`}>
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${dept.bg}`}>
                <dept.icon className={`h-6 w-6 ${dept.color}`} />
              </div>
              <h3 className={`mb-4 text-lg font-semibold ${dept.color}`}>{dept.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {dept.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`h-1.5 w-1.5 rounded-full ${dept.bg} ${dept.color}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div ref={statsRef} className={`mt-10 rounded-2xl border border-border bg-card p-6 transition-all duration-700 delay-300 ease-out ${statsVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {quickStats.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-card-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Tech Stack Section ---
const medicalCategories = [
  { category: "Diagnostic Imaging", items: [{ name: "MRI Scanning", desc: "3T High-Resolution" }, { name: "CT Imaging", desc: "128-Slice Scanner" }, { name: "Digital X-Ray", desc: "Low Radiation Dose" }, { name: "Ultrasound", desc: "4D Color Doppler" }] },
  { category: "Laboratory", items: [{ name: "Hematology Panel", desc: "CBC & Differentials" }, { name: "Metabolic Profile", desc: "Glucose, Lipids, Liver" }, { name: "Immunology", desc: "Antibody & Allergy Testing" }, { name: "Pathology", desc: "Biopsy & Cytology" }] },
  { category: "Surgical Suites", items: [{ name: "Robotic Surgery", desc: "Da Vinci Xi System" }, { name: "Laparoscopy", desc: "Minimally Invasive" }, { name: "Endoscopy Center", desc: "GI & Pulmonary" }, { name: "Cath Lab", desc: "Cardiac Interventions" }] },
  { category: "Patient Care", items: [{ name: "ICU Monitoring", desc: "24/7 Telemetry" }, { name: "Rehabilitation", desc: "Physical & Occupational" }, { name: "Telemedicine", desc: "Virtual Consultations" }, { name: "Home Health", desc: "Post-Discharge Care" }] },
]

export function TechStackSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Medical Capabilities</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Advanced Equipment & Services</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">State-of-the-art medical technology and compassionate care teams ensuring accurate diagnosis and effective treatment.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          {medicalCategories.map((cat) => (
            <div key={cat.category}>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-primary uppercase">{cat.category}</h3>
              <div className="flex flex-col gap-3">
                {cat.items.map((item) => (
                  <div key={item.name} className="rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30">
                    <div className="text-sm font-medium text-card-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Roadmap Section ---
const careJourney = [
  { phase: "Step 1", title: "Symptom Assessment & Triage", status: "complete" as const, description: "Initial Evaluation", tasks: ["AI-powered symptom checker analyzes your condition", "Severity level is determined (mild, moderate, urgent)", "Relevant medical history is reviewed", "You receive triage recommendations instantly"] },
  { phase: "Step 2", title: "Doctor Matching & Appointment", status: "complete" as const, description: "Finding the Right Specialist", tasks: ["AI matches you with top-rated specialists", "View real-time availability and clinic locations", "Book in-person or telemedicine appointments", "Receive pre-visit instructions and preparation tips"] },
  { phase: "Step 3", title: "Consultation & Diagnosis", status: "in-progress" as const, description: "Professional Medical Care", tasks: ["Comprehensive physical or virtual examination", "Lab work, imaging, or diagnostic tests ordered", "AI assists the doctor in analyzing test results", "Clear diagnosis and treatment plan provided"] },
  { phase: "Step 4", title: "Treatment & Follow-Up", status: "upcoming" as const, description: "Ongoing Care & Recovery", tasks: ["Prescription management and pharmacy integration", "Post-visit follow-up reminders and check-ins", "AI monitors your recovery progress over time", "Seamless referral to specialists if needed"] },
]

function StatusIcon({ status }: { status: "complete" | "in-progress" | "upcoming" }) {
  if (status === "complete") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  if (status === "in-progress") return <Clock className="h-5 w-5 text-accent" />
  return <Circle className="h-5 w-5 text-muted-foreground" />
}

function StatusBadge({ status }: { status: "complete" | "in-progress" | "upcoming" }) {
  const styles = { complete: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", "in-progress": "bg-accent/10 text-accent", upcoming: "bg-muted text-muted-foreground" }
  const labels = { complete: "Available Now", "in-progress": "In Progress", upcoming: "Coming Soon" }
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>{labels[status]}</span>
}

export function RoadmapSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation(0.05)

  return (
    <section className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Your Care Journey</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">From Symptoms to Recovery</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">Our streamlined process ensures you get the right care at the right time, guided by AI and supported by expert physicians.</p>
        </div>
        <div ref={stepsRef} className="mt-16 flex flex-col gap-6">
          {careJourney.map((step, i) => (
            <div key={step.phase} className={`rounded-2xl border border-border bg-card p-6 lg:p-8 transition-all duration-700 ease-out ${stepsVisible ? "translate-x-0 opacity-100" : i % 2 === 0 ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"}`} style={{ transitionDelay: `${150 + i * 120}ms` }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon status={step.status} />
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-card-foreground">{step.phase}: {step.title}</h3>
                      <StatusBadge status={step.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {step.tasks.map((task) => (
                  <div key={task} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {task}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Security Section ---
const securityFeatures = [
  { icon: Shield, title: "HIPAA Compliance", items: ["All patient records encrypted end-to-end", "Strict access controls per staff role", "Mandatory annual compliance training", "Regular third-party compliance audits"] },
  { icon: Lock, title: "Patient Data Protection", items: ["Medical records stored with AES-256 encryption", "Secure patient portal with 2FA login", "Automated data anonymization for research", "30-day data retention policy for guest users"] },
  { icon: Eye, title: "Clinical Quality Assurance", items: ["Board-certified physicians and specialists", "Evidence-based clinical decision support", "Peer-reviewed AI diagnostic models", "Continuous quality improvement programs"] },
]

const certifications = [
  { icon: Award, title: "Joint Commission Accredited", desc: "Gold Seal of Approval" },
  { icon: Heart, title: "AHA Certified Center", desc: "Heart & Stroke Care" },
  { icon: Shield, title: "HITRUST CSF Certified", desc: "Healthcare Security" },
]

export function SecuritySection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation()
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1)
  const { ref: certRef, isVisible: certVisible } = useScrollAnimation(0.2)

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div ref={headerRef} className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${headerVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          <span className="text-sm font-semibold tracking-wider text-primary uppercase">Safety & Compliance</span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Your Privacy and Safety Come First</h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">We adhere to the highest healthcare regulations and quality standards to protect your personal health information.</p>
        </div>
        <div ref={gridRef} className={`mt-16 grid gap-6 lg:grid-cols-3 transition-all duration-700 delay-150 ease-out ${gridVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
          {securityFeatures.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">{feature.title}</h3>
              <ul className="flex flex-col gap-3">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <FileCheck size={16} className="shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div ref={certRef} className={`mt-10 rounded-2xl border border-border bg-card p-6 transition-all duration-700 delay-300 ease-out ${certVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
          <h3 className="mb-4 text-center text-sm font-semibold tracking-wider text-muted-foreground uppercase">Accreditations & Certifications</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {certifications.map((cert) => (
              <div key={cert.title} className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <cert.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-card-foreground">{cert.title}</div>
                  <div className="text-xs text-muted-foreground">{cert.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FileCheck(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
  )
}

// --- Footer Section ---
export function FooterSection() {
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation(0.15)

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div ref={ctaRef} className={`rounded-2xl bg-primary p-8 text-center sm:p-12 lg:p-16 transition-all duration-700 ease-out ${ctaVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"}`}>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl font-heading">Ready to Transform Your Care Experience?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">Join 260,000+ patients already using Care for smarter, faster, and more accessible healthcare.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 gap-2 px-8 text-base">Create Free Account <ArrowRight className="h-4 w-4" /></Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 px-8 text-base">Learn More</Button>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <a href="#home" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold italic text-card-foreground font-heading">Care</span>
              </a>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Your intelligent healthcare companion, making quality healthcare accessible to everyone.</p>
            </div>
            {[{ title: "Platform", links: ["Features", "AI Assistant", "Find Doctors", "Pricing"] }, { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] }, { title: "Legal", links: ["Privacy Policy", "Terms of Service", "HIPAA Notice", "Cookie Policy"] }].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-card-foreground">{col.title}</h4>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">2026 Care. All rights reserved.</p>
            <div className="flex items-center gap-4"><span className="text-sm text-muted-foreground">Built with care for better healthcare.</span></div>
          </div>
        </div>
      </div>
    </footer>
  )
}
