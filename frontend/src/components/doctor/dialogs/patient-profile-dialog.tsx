// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  MapPin
} from "lucide-react"

export interface PatientProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: unknown
}

export function PatientProfileDialog({ open, onOpenChange, patient }: PatientProfileDialogProps) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 bg-muted/30 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={patient.avatar} alt={patient.name} />
              <AvatarFallback>{patient.initials || patient.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  <p className="text-sm text-muted-foreground">ID: {patient.id || "P-102934"}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <MessageSquare className="h-4 w-4" /> Message
                  </Button>
                  <Button size="sm" className="gap-2">
                    <Pill className="h-4 w-4" /> Prescribe
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="h-3.3 w-3" /> +1 (555) 123-4567</span>
                <span className="flex items-center gap-1"><Mail className="h-3.3 w-3" /> {patient.email || "patient@example.com"}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.3 w-3" /> New York, NY</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b">
            <TabsList className="bg-transparent border-0 gap-6 w-full justify-start h-12">
              <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">Overview</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">Medical History</TabsTrigger>
              <TabsTrigger value="medications" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">Medications</TabsTrigger>
              <TabsTrigger value="labs" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">Lab Results</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <h4 className="text-xs font-bold uppercase text-primary mb-2">Primary Condition</h4>
                  <p className="text-lg font-semibold">{patient.condition || "Hypertension"}</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                  <h4 className="text-xs font-bold uppercase text-orange-600 mb-2">Active Risks</h4>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">Smoker</Badge>
                  <Badge variant="outline" className="text-orange-600 border-orange-200 ml-2">High BMI</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Recent Vitals
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">BP</p>
                    <p className="text-sm font-bold">128/84</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">HR</p>
                    <p className="text-sm font-bold">72 bpm</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Temp</p>
                    <p className="text-sm font-bold">98.6°F</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">SpO2</p>
                    <p className="text-sm font-bold">98%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold">Patient Notes</h3>
                <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg italic">
                  "Patient reports occasional headaches during exertion. Has been adherent to medication schedule. Lifestyle modifications discussed."
                </p>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 space-y-4">
              {[
                { date: "Jan 15, 2024", diagnosis: "Routine Checkup", doctor: "Dr. Sarah Miller", note: "Everything normal." },
                { date: "Dec 10, 2023", diagnosis: "Common Cold", doctor: "Dr. Elena Popova", note: "Prescribed basic antivirals." },
                { date: "Oct 22, 2023", diagnosis: "Mild Hypertension", doctor: "Dr. Michael Smith", note: "Initial diagnosis. Started Lisinopril." },
              ].map((entry, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="text-xs font-bold text-muted-foreground w-20 pt-1">{entry.date}</div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-sm">{entry.diagnosis}</p>
                    <p className="text-xs text-muted-foreground">Seen by {entry.doctor}</p>
                    <p className="text-xs italic">"{entry.note}"</p>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="medications" className="mt-0">
              <div className="space-y-2">
                {[
                  { name: "Lisinopril 10mg", dosage: "1 pill daily", left: 15 },
                  { name: "Amlodipine 5mg", dosage: "1 pill daily", left: 22 },
                ].map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-bold text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.dosage}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{med.left} days left</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
