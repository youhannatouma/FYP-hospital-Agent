// @ts-nocheck
"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Star, Phone, Mail, Clock } from "lucide-react"

interface DoctorDetailDialogProps {
  doctor: unknown
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DoctorDetailDialog({
  doctor,
  open,
  onOpenChange,
}: DoctorDetailDialogProps) {
  if (!doctor) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/10">
              <AvatarImage src={doctor.image} alt={doctor.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {doctor.name?.split(" ").map((n: string) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                {doctor.name}
              </DialogTitle>
              <p className="text-primary font-medium">{doctor.specialty}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-sm font-semibold text-foreground">
                  {doctor.rating || "4.9"}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({doctor.reviews || "120"} reviews)
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Experience</span>
              </div>
              <p className="text-sm font-medium text-foreground">{doctor.experience || "12+ Years"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Location</span>
              </div>
              <p className="text-sm font-medium text-foreground">{doctor.location || "City Hospital"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {doctor.about || "Dr. " + doctor.name + " is a highly experienced " + doctor.specialty + " dedicated to providing exceptional patient care with a focus on personalized treatment plans."}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">{doctor.phone || "+1 (555) 000-0000"}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">{doctor.email || doctor.name?.toLowerCase().replace(" ", ".") + "@hospital.com"}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <CalendarDays className="h-4 w-4" />
              Book Appointment
            </Button>
            <Button variant="outline" className="flex-1 border-border text-foreground">
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
