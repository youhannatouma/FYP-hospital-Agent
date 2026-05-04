// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  CalendarDays, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Award, 
  Activity, 
  Users,
  CheckCircle,
  XCircle,
  Stethoscope,
  Briefcase
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DoctorDetailDialogProps {
  doctor: unknown
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdminView?: boolean
}

export function DoctorDetailDialog({
  doctor,
  open,
  onOpenChange,
  isAdminView = false
}: DoctorDetailDialogProps) {
  const { toast } = useToast()

  if (!doctor) return null

  const initials = doctor.name?.split(" ").map((n: string) => n[0]).join("") || "DR"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogTitle className="sr-only">Doctor Details: {doctor.name}</DialogTitle>
        <DialogDescription className="sr-only">Professional profile and clinical impact summary for {doctor.name}</DialogDescription>
        <div className="p-8 bg-gradient-to-br from-blue-500/10 via-background to-background border-b relative">
           <div className="absolute top-4 right-8 flex gap-2">
             <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-blue-200 text-blue-600 font-bold">
               {doctor.specialty || "Specialist"}
             </Badge>
             {doctor.verified !== undefined && (
               <Badge className={
                 doctor.verified ? "bg-emerald-500 text-white border-none font-bold" :
                 "bg-amber-500 text-white border-none font-bold"
               }>
                 {doctor.verified ? "VERIFIED" : "PENDING VERIFICATION"}
               </Badge>
             )}
           </div>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-1 ring-blue-500/10">
              <AvatarImage src={doctor.image} alt={doctor.name} />
              <AvatarFallback className="bg-blue-600 text-white text-3xl font-black italic">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                  {doctor.name}
                  {doctor.verified && <CheckCircle className="h-5 w-5 text-blue-500" />}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md"><Stethoscope className="h-3.5 w-3.5" /> MD, Cardiology</span>
                  <span className="flex items-center gap-1 font-medium"><Star className="h-4 w-4 fill-amber-500 text-amber-500" /> 4.9 (124 reviews)</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg italic font-medium">
                "Dedicated to advancing patient wellness through innovative clinical practices and personalized care strategies since 2012."
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="flex-1 flex flex-col min-h-0 bg-card">
          <div className="px-8 border-b">
            <TabsList className="bg-transparent border-0 gap-8 w-full justify-start h-14">
              <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-0 h-14 text-sm font-bold">Professional Profile</TabsTrigger>
              <TabsTrigger value="credentials" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-0 h-14 text-sm font-bold">Credentials & Awards</TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-0 h-14 text-sm font-bold">Clinical Impact</TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-0 h-14 text-sm font-bold">Direct Communication</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-8">
              <TabsContent value="profile" className="mt-0 space-y-8 pb-8 focus-visible:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 mb-2 tracking-widest">Core Experience</h4>
                    <p className="text-xl font-bold font-heading">{doctor.experience || "12+ Quality Years"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Specialized in Interventional Cardiology</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-500/5 border border-slate-500/10 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase text-slate-600 mb-2 tracking-widest">Current Posting</h4>
                    <p className="text-xl font-bold font-heading">{doctor.location || "Central Medical Hub"}</p>
                    <p className="text-xs text-muted-foreground mt-1 text-blue-600 font-bold underline cursor-pointer">View Facility Details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2 tracking-tight">
                    <Briefcase className="h-5 w-5 text-blue-600" /> Professional Background
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-6 rounded-2xl border-2 border-dashed">
                    Dr. {doctor.name} is a board-certified {doctor.specialty} with a distinguished career in complex clinical cases. After completing residency at Johns Hopkins, they have focused on outpatient care optimization and digital health integration. Known for high patient satisfaction and rigorous diagnostic standards.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Expertise Areas</h4>
                        <div className="flex flex-wrap gap-2">
                            {["Echocardiography", "Hypertension", "Prevention", "Heart Rhythm"].map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] font-bold py-0.5 bg-muted/50 border-blue-100">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                             <Badge variant="secondary" className="text-[10px] font-black">English (Native)</Badge>
                             <Badge variant="secondary" className="text-[10px] font-black">Spanish (Fluent)</Badge>
                        </div>
                    </div>
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="mt-0 space-y-6 focus-visible:outline-none">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b pb-2">Verified Certifications</h3>
                   {[
                    { title: "American Board of Internal Medicine", year: "2015", id: "CERT-992-8871" },
                    { title: "Fellow of the American College of Cardiology", year: "2018", id: "FACC-552-110" },
                    { title: "Advanced Cardiovascular Life Support (ACLS)", year: "2023", id: "AHA-9902" },
                  ].map((cert, i) => (
                    <div key={i} className="flex items-center justify-between p-5 border rounded-2xl bg-card shadow-sm hover:border-blue-300 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="font-black text-sm text-foreground">{cert.title}</p>
                             <p className="text-[10px] text-muted-foreground uppercase font-bold">Credential ID: {cert.id}</p>
                          </div>
                       </div>
                       <Badge variant="outline" className="font-bold border-blue-100">{cert.year}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-0 space-y-8 focus-visible:outline-none">
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center space-y-1 shadow-sm">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Avg Rating</p>
                      <p className="text-2xl font-black text-emerald-600">4.92</p>
                      <Badge className="text-[9px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700 border-none font-black">+4% WoW</Badge>
                    </div>
                    <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center space-y-1 shadow-sm">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Total Appts</p>
                      <p className="text-2xl font-black text-blue-600">1,248</p>
                      <p className="text-[10px] text-muted-foreground font-bold">SINCE 2022</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-center space-y-1 shadow-sm">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Avg Consult</p>
                      <p className="text-2xl font-black text-purple-600">22m</p>
                      <p className="text-[10px] text-muted-foreground font-bold">EXCELLENCE</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center space-y-1 shadow-sm">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">EHR Sync</p>
                      <p className="text-2xl font-black text-amber-600">99.8%</p>
                      <p className="text-[10px] text-amber-600 font-bold uppercase">GOLD</p>
                    </div>
                 </div>

                 <div className="p-6 rounded-2xl bg-card border-2 border-dashed text-center space-y-3">
                    <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                    <h4 className="font-black text-lg">Patient Growth Metrics</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">This doctor has maintained a consistent 96% retention rate for chronic heart management patients over the last 12 months.</p>
                 </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-0 space-y-8 focus-visible:outline-none">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Secure Direct Contact</h3>
                       <div className="space-y-3">
                          <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-blue-200 transition-all text-left">
                            <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-xl bg-background shadow-sm flex items-center justify-center text-blue-600">
                                  <Phone className="h-5 w-5" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Work Phone</p>
                                  <p className="font-bold text-foreground">+1 (555) 012-9988</p>
                               </div>
                            </div>
                            <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black">SMS ENABLED</Badge>
                          </button>
                          <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-blue-200 transition-all text-left">
                             <div className="h-10 w-10 rounded-xl bg-background shadow-sm flex items-center justify-center text-blue-600">
                                <Mail className="h-5 w-5" />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Internal Email</p>
                                <p className="font-bold text-foreground">{doctor.email || "j.smith@medical-portal.org"}</p>
                             </div>
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Operational Hours</h3>
                       <div className="p-6 rounded-2xl border bg-card/50 space-y-4 font-mono text-sm">
                          {[
                            { day: "MON - FRI", hours: "09:00 AM - 05:00 PM", status: "Available" },
                            { day: "SATURDAY", hours: "10:00 AM - 02:00 PM", status: "On-Call Only" },
                            { day: "SUNDAY", hours: "CLOSED", status: "Emergency Ready" },
                          ].map((slot, i) => (
                            <div key={i} className="flex justify-between items-center border-b last:border-0 pb-3 last:pb-0">
                               <span className="font-bold text-muted-foreground">{slot.day}</span>
                               <div className="text-right">
                                  <p className="font-black text-foreground">{slot.hours}</p>
                                  <p className="text-[10px] text-emerald-500 font-black">{slot.status}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <div className="p-6 border-t bg-muted/10 flex gap-4">
           {isAdminView ? (
             <>
               <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 gap-2"
                 onClick={() => {
                   onOpenChange(false)
                   toast({ title: "Doctor Verified", description: `Credentials for ${doctor.name} have been successfully verified.` })
                 }}
               >
                 <CheckCircle className="h-5 w-5" /> Verify Provider
               </Button>
               <Button variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-black h-12 gap-2"
                 onClick={() => {
                   onOpenChange(false)
                   toast({ title: "Under Review", description: `Doctor ${doctor.name} has been flagged for administrative review.` })
                 }}
               >
                 <XCircle className="h-5 w-5" /> Flag for Review
               </Button>
             </>
           ) : (
             <>
               <Button 
                 className="flex-1 bg-blue-600 text-white hover:bg-blue-700 gap-3 h-12 font-black shadow-lg shadow-blue-500/20"
                 onClick={() => {
                   onOpenChange(false)
                   toast({
                     title: "Scheduling System",
                     description: "Redirecting to " + doctor.name + "'s clinical calendar...",
                   })
                 }}
               >
                 <CalendarDays className="h-5 w-5" />
                 Book Clinical Appointment
               </Button>
               <Button 
                variant="outline" 
                className="border-slate-200 text-slate-700 font-bold h-12 px-8"
                onClick={() => {
                  toast({
                    title: "Communication Portal",
                    description: "Initializing secure chat with Dr. " + doctor.name + "...",
                  })
                }}
              >
                Send Message
              </Button>
             </>
           )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
