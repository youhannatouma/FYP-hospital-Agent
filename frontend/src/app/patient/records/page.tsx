"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Star,
  MapPin,
  Clock,
  Video,
  Bot,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Filter,
  ShieldCheck,
} from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import { AiSymptomDialog } from "@/components/patient/dialogs/ai-symptom-dialog"
import { BookAppointmentDialog } from "@/components/patient/dialogs/book-appointment-dialog"
import { m, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const specialties = [
  "All Specialties",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "General Practice",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
]

const doctors = [
  {
    id: 1,
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    rating: 4.9,
    reviews: 324,
    location: "Downtown Medical Center",
    distance: "2.3 mi",
    nextSlot: "Today, 3:00 PM",
    fee: "$150",
    avatar: "MC",
    availableToday: true,
    videoConsult: true,
    experience: "15 years",
  },
  {
    id: 2,
    name: "Dr. Emily Watson",
    specialty: "General Practice",
    rating: 4.8,
    reviews: 512,
    location: "Westside Clinic",
    distance: "1.5 mi",
    nextSlot: "Tomorrow, 10:00 AM",
    fee: "$100",
    avatar: "EW",
    availableToday: false,
    videoConsult: true,
    experience: "12 years",
  },
  {
    id: 3,
    name: "Dr. Raj Patel",
    specialty: "Endocrinology",
    rating: 4.7,
    reviews: 198,
    location: "Central Hospital",
    distance: "4.1 mi",
    nextSlot: "Jan 18, 9:00 AM",
    fee: "$175",
    avatar: "RP",
    availableToday: false,
    videoConsult: false,
    experience: "20 years",
  },
  {
    id: 4,
    name: "Dr. Sarah Kim",
    specialty: "Dermatology",
    rating: 4.9,
    reviews: 287,
    location: "Skin Health Clinic",
    distance: "3.0 mi",
    nextSlot: "Today, 4:30 PM",
    fee: "$200",
    avatar: "SK",
    availableToday: true,
    videoConsult: true,
    experience: "10 years",
  },
]

export default function FindDoctorPage() {
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties")
  
  const [symptomText, setSymptomText] = useState("")
  const [showAiDialog, setShowAiDialog] = useState(false)
  
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [showBookDialog, setShowBookDialog] = useState(false)

  const handleCheckSymptoms = () => {
    if (!symptomText.trim()) {
      toast({
        title: "Protocol Interrupted",
        description: "Please describe your physiological state for AI analysis.",
        variant: "destructive"
      })
      return
    }
    setShowAiDialog(true)
  }

  const handleBookNow = (doctorName: string) => {
    setSelectedDoctor(doctorName)
    setShowBookDialog(true)
  }

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" || doc.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-10 max-w-[1400px] mx-auto pb-24"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between px-2 pt-4">
        <div className="space-y-4">
          <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
            Provider Network
          </Badge>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-none lg:text-5xl">
            Find Specialists
          </h1>
          <p className="text-muted-foreground mt-4 font-medium text-lg max-w-lg leading-relaxed">
            Access world-class expertise. Our network is curated for clinical excellence and patient safety.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
           <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border/50 text-emerald-500 shadow-sm">
             <ShieldCheck className="h-5 w-5" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Verification</p>
              <p className="text-xs font-bold text-foreground">All Providers Credentialed</p>
           </div>
        </div>
      </div>

      {/* AI Symptom Checker - Premium Integration */}
      <section className="px-2">
        <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-slate-900 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
          <CardContent className="relative z-10 p-8 md:p-10 flex flex-col lg:flex-row items-center gap-10">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 lg:w-1/3">
              <div className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-glow animate-pulse">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black text-white tracking-tight">AI Differential Diagnostics</h2>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed">
                   Describe your symptoms in natural language. Our neural engine will map your condition to the most qualified department.
                 </p>
              </div>
            </div>
            
            <div className="flex-1 w-full bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 flex flex-col md:flex-row items-center gap-4 group-hover:bg-white/10 transition-colors">
              <div className="relative flex-1 w-full">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50" />
                <Input
                  placeholder="Describe your symptoms (e.g. fatigue, localized pain)..."
                  className="w-full h-14 pl-12 bg-transparent border-none text-white placeholder:text-slate-500 text-lg font-medium focus-visible:ring-0"
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                />
              </div>
              <Button 
                size="lg"
                className="w-full md:w-auto bg-primary text-white hover:bg-primary/90 h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-glow active:scale-95 transition-all"
                onClick={handleCheckSymptoms}
              >
                Analyze State
              </Button>
            </div>
          </CardContent>
          
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        </Card>
      </section>

      {/* Filters UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="relative flex-1 max-w-xl">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
           <Input
             placeholder="Search by specialty, doctor name, or clinical focus..."
             className="h-14 pl-12 rounded-2xl bg-card border-border/50 font-medium shadow-subtle focus:ring-primary/20"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="w-48 h-12 rounded-xl bg-card border-border/50 font-bold text-xs">
              <Stethoscope className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              {specialties.map((s) => (
                <SelectItem key={s} value={s} className="font-bold text-xs uppercase tracking-wider">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="h-12 w-12 rounded-xl border-border/50">
             <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-2">
        <AnimatePresence mode="popLayout">
          {filteredDoctors.map((doctor, idx) => (
            <m.div
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <Card className="premium-card rounded-[2.5rem] border-none shadow-premium bg-card overflow-hidden h-full flex flex-col group-hover:-translate-y-2 transition-transform duration-500">
                <div className="p-6 pb-0 flex items-center justify-between">
                   <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                     {doctor.experience} Exp
                   </Badge>
                   <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-black text-foreground">{doctor.rating}</span>
                   </div>
                </div>

                <CardContent className="p-8 pt-4 flex flex-col items-center text-center flex-1">
                   <div className="relative mb-6">
                      <Avatar className="h-28 w-28 ring-8 ring-muted/50 shadow-2xl">
                        <AvatarFallback className="bg-gradient-to-br from-primary/5 to-primary/20 text-primary text-2xl font-black">
                          {doctor.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {doctor.availableToday && (
                        <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-background shadow-glow" />
                      )}
                   </div>
                   
                   <h3 className="text-xl font-black text-foreground tracking-tight leading-4 mb-2 group-hover:text-primary transition-colors">
                     {doctor.name}
                   </h3>
                   <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">
                     {doctor.specialty}
                   </p>

                   <div className="w-full space-y-3 py-6 border-y border-border/30">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Area</span>
                        <span className="text-foreground">{doctor.distance}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Next Window</span>
                        <span className="text-foreground">{doctor.nextSlot.split(',')[0]}</span>
                      </div>
                   </div>

                   <div className="mt-8 w-full flex flex-col gap-3">
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Consult Fee</span>
                         <span className="text-lg font-black text-foreground">{doctor.fee}</span>
                      </div>
                      <Button 
                        size="lg"
                        className="w-full bg-slate-900 dark:bg-slate-800 text-white hover:bg-primary h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-subtle transition-all active:scale-95 group/btn"
                        onClick={() => handleBookNow(doctor.name)}
                      >
                         Secure Appointment
                         <ChevronRight className="h-3 w-3 ml-2 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                      </Button>
                   </div>
                </CardContent>
              </Card>
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      <AiSymptomDialog 
        open={showAiDialog} 
        onOpenChange={setShowAiDialog}
        initialSymptom={symptomText}
      />
      <BookAppointmentDialog 
        open={showBookDialog} 
        onOpenChange={setShowBookDialog}
        defaultDoctor={selectedDoctor || undefined}
      />
    </m.div>
  )
}
