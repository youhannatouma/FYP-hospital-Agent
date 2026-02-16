"use client"

import { useState } from "react"
import { useDataStore } from "@/hooks/use-data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Star,
  MapPin,
  Clock,
  Video,
  Bot,
  Stethoscope,
  Filter,
  CalendarPlus,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BookAppointmentDialog } from "@/components/patient/appointments/book-appointment-dialog"

export default function FindDoctorPage() {
  const { toast } = useToast()
  const { getDoctors } = useDataStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties")

  const doctors = getDoctors()
  const specialties = ["All Specialties", ...new Set(doctors.map(d => d.specialty).filter(Boolean))]

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" || doc.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find a Specialist</h1>
        <p className="text-sm text-muted-foreground">
          Search for verified physicians and book clinical consultations
        </p>
      </div>

      {/* AI Symptom Checker */}
      <Card className="border-primary/20 bg-primary/5 shadow-inner">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground">
              Clinical Alriage
            </h3>
            <p className="text-sm text-muted-foreground">
              Describe symptoms for an automated specialist recommendation
            </p>
          </div>
          <Input
            placeholder="e.g., persistent joint pain in knees..."
            className="max-w-md bg-background border-primary/20"
          />
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            onClick={() => {
              toast({
                title: "AI Analysis Initiated",
                description: "Reviewing symptoms against clinical database...",
              })
            }}
          >
            Check Now
          </Button>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name or specialty..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedSpecialty}
          onValueChange={setSelectedSpecialty}
        >
          <SelectTrigger className="w-48">
            <Stethoscope className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((s) => (
              <SelectItem key={s} value={s!}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="any">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Time</SelectItem>
            <SelectItem value="today">Available Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-200 group"
          >
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors">
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-primary font-medium">{doctor.specialty || 'General Practitioner'}</p>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-bold text-card-foreground">
                      {doctor.rating || '4.8'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({doctor.reviewCount || '120'}+ reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">
                    {doctor.clinicAddress || 'Medical Plaza, Ste 402'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Next: Today, 2:30 PM</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[10px] font-semibold bg-primary/5 text-primary border-0">
                  {doctor.yearsOfExperience || '10'}+ Yrs Exp
                </Badge>
                {doctor.status === 'Active' && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] border-0 font-semibold px-2">
                    Online Now
                  </Badge>
                )}
                <Badge className="bg-blue-500/10 text-blue-600 text-[10px] border-0 font-semibold px-2">
                  <Video className="mr-1 h-3 w-3" />
                  Virtual Consultation
                </Badge>
              </div>

              <div className="mt-auto pt-6">
                <BookAppointmentDialog 
                  initialDoctorId={doctor.id}
                  trigger={
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm font-semibold">
                      <CalendarPlus className="h-4 w-4" />
                      Book Consultation
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            No Specialists Found
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Try adjusting your search terms or selecting a different clinical specialty.
          </p>
        </div>
      )}
    </div>
  )
}
