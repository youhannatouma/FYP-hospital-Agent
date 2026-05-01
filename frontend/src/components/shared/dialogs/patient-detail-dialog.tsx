// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  History, 
  MessageSquare, 
  Pill, 
  Activity, 
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Clock
} from "lucide-react"

export interface PatientDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: unknown
}

export function PatientDetailDialog({ open, onOpenChange, patient }: PatientDetailDialogProps) {
  if (!patient) return null

  const initials = patient.initials || patient.name?.split(' ').map((n: string) => n[0]).join('') || "P"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogTitle className="sr-only">Patient Details: {patient.name}</DialogTitle>
        <DialogDescription className="sr-only">Full clinical profile and history for {patient.name}</DialogDescription>
        <div className="p-8 bg-gradient-to-br from-primary/10 via-background to-background border-b relative">
           <div className="absolute top-4 right-8 flex gap-2">
             <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
               ID: {patient.id || "P-102934"}
             </Badge>
             {patient.status && (
               <Badge className={
                 patient.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border-none" :
                 "bg-amber-500/10 text-amber-500 border-none"
               }>
                 {patient.status}
               </Badge>
             )}
           </div>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg ring-1 ring-primary/10">
              <AvatarImage src={patient.avatar || patient.image} alt={patient.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{patient.name}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" /> 32 Years, Male</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {patient.joined || "Jan 2024"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="sm" variant="secondary" className="gap-2 h-8 text-xs font-bold">
                  <MessageSquare className="h-3.5 w-3.5" /> Message Patient
                </Button>
                <Button size="sm" className="gap-2 h-8 text-xs font-bold shadow-md shadow-primary/20">
                  <Pill className="h-3.5 w-3.5" /> New Prescription
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 bg-card">
          <div className="px-8 border-b">
            <TabsList className="bg-transparent border-0 gap-8 w-full justify-start h-14">
              <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none px-0 h-14 text-sm font-bold">Overview</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none px-0 h-14 text-sm font-bold">Clinical History</TabsTrigger>
              <TabsTrigger value="medications" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none px-0 h-14 text-sm font-bold">Medications</TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none px-0 h-14 text-sm font-bold">Contact & Demographics</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-8">
              <TabsContent value="overview" className="mt-0 space-y-8 pb-8 focus-visible:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm transition-all hover:shadow-md">
                    <h4 className="text-[10px] font-black uppercase text-primary mb-2 tracking-widest">Primary Diagnosis</h4>
                    <p className="text-xl font-bold text-foreground">{patient.condition || "Chronic Hypertension"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Managed since March 2023</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 shadow-sm transition-all hover:shadow-md">
                    <h4 className="text-[10px] font-black uppercase text-orange-600 mb-2 tracking-widest">Active Alerts</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-background text-orange-600 border-orange-200 font-bold">Late Response</Badge>
                      <Badge variant="outline" className="bg-background text-rose-600 border-rose-200 font-bold">Allergy: Penicillin</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Latest Clinical Vitals
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl border bg-card/50 text-center space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">BP</p>
                      <p className="text-lg font-black text-primary">128/84</p>
                      <p className="text-[10px] text-emerald-500 font-bold">NORMAL</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card/50 text-center space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">HR</p>
                      <p className="text-lg font-black text-primary">72 bpm</p>
                      <p className="text-[10px] text-emerald-500 font-bold">STABLE</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card/50 text-center space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">TEMP</p>
                      <p className="text-lg font-black text-primary">98.6°F</p>
                      <p className="text-[10px] text-emerald-500 font-bold">NORMAL</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card/50 text-center space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black">SpO2</p>
                      <p className="text-lg font-black text-primary">98%</p>
                      <p className="text-[10px] text-emerald-500 font-bold">OPTIMAL</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Physician's Summary</h3>
                  <div className="p-6 rounded-2xl bg-muted/40 border-2 border-dashed border-muted relative">
                    <AlertCircle className="absolute top-4 right-4 h-4 w-4 text-muted-foreground/40" />
                    <p className="text-sm text-foreground leading-relaxed italic">
                      "Patient shows good adherence to the current pharmacological regimen. Reported occasional headaches during heavy exertion, but BP remain within target range. Recommended increased hydration and low-sodium diet."
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-tighter">Last Modified by Dr. Smith • Feb 12, 2024</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0 space-y-6 focus-visible:outline-none">
                {[
                  { date: "Jan 15, 2024", diagnosis: "Routine Cardiology Checkup", doctor: "Dr. Sarah Miller", note: "Cardiac rhythm normal, valves healthy." },
                  { date: "Dec 10, 2023", diagnosis: "Acute Rhinovirus", doctor: "Dr. Elena Popova", note: "Mild symptoms, symptomatic treatment prescribed." },
                  { date: "Oct 22, 2023", diagnosis: "Initial Hypertension Dx", doctor: "Dr. Michael Smith", note: "Stage 1 Hypertension confirmed. Started Lisinopril 10mg." },
                  { date: "Aug 05, 2023", diagnosis: "Annual Health Screening", doctor: "Dr. David Chen", note: "Blood panel shows elevated triglyercides." },
                ].map((entry, i) => (
                  <div key={i} className="flex gap-6 pb-6 border-b last:border-0 hover:bg-muted/5 p-4 rounded-xl transition-colors">
                    <div className="text-xs font-black text-primary/60 w-24 pt-1 uppercase tracking-tighter">{entry.date}</div>
                    <div className="flex-1 space-y-2">
                      <p className="font-bold text-base text-foreground">{entry.diagnosis}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] h-5 py-0">Attending: {entry.doctor}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">"{entry.note}"</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="medications" className="mt-0 space-y-4 focus-visible:outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "Lisinopril 10mg", dosage: "1 pill daily", left: 15, type: "ACE Inhibitor" },
                    { name: "Amlodipine 5mg", dosage: "1 pill daily", left: 22, type: "Calcium Channel Blocker" },
                    { name: "Atorvastatin 20mg", dosage: "1 pill at bedtime", left: 8, type: "Statin" },
                    { name: "Metformin 500mg", dosage: "2 pills with dinner", left: 30, type: "Antidiabetic" },
                  ].map((med, i) => (
                    <div key={i} className="flex flex-col p-5 border rounded-2xl bg-card hover:border-primary/50 transition-all shadow-sm group">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black">{med.type}</Badge>
                        <Badge variant="secondary" className="text-[9px] font-bold group-hover:bg-primary group-hover:text-primary-foreground">{med.left} Days Remaining</Badge>
                      </div>
                      <h4 className="font-black text-lg text-foreground mb-1">{med.name}</h4>
                      <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> {med.dosage}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-0 space-y-6 focus-visible:outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Contact Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border">
                        <div className="p-2 rounded-lg bg-background shadow-sm">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number</p>
                          <p className="text-sm font-bold">{patient.phone || "+1 (555) 123-4567"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border">
                        <div className="p-2 rounded-lg bg-background shadow-sm">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</p>
                          <p className="text-sm font-bold">{patient.email || "patient.sarah@mail.com"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border">
                        <div className="p-2 rounded-lg bg-background shadow-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Residential Address</p>
                          <p className="text-sm font-bold">128 Healthcare Ave, Central District, NY</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Emergency Contact</h3>
                    <div className="p-6 rounded-2xl border-2 border-primary/10 bg-primary/5 space-y-4 shadow-inner">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm">AJ</div>
                         <div>
                            <p className="font-bold text-foreground">Arthur Johnson</p>
                            <p className="text-[10px] text-primary font-black uppercase">Spouse • Emergency Authorized</p>
                         </div>
                      </div>
                      <div className="pt-2 space-y-2 border-t border-primary/10">
                         <div className="flex justify-between text-xs">
                           <span className="text-muted-foreground font-medium">Contact</span>
                           <span className="font-black text-foreground">+1 (555) 009-8877</span>
                         </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-muted-foreground font-medium">Permission</span>
                           <span className="font-black text-emerald-600 uppercase">FULL ACCESS</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
