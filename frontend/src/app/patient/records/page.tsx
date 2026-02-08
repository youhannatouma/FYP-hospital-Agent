"use client"

import { useState } from "react"
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
} from "lucide-react"

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
  {
    id: 5,
    name: "Dr. James Rodriguez",
    specialty: "Orthopedics",
    rating: 4.6,
    reviews: 145,
    location: "Sports Medicine Center",
    distance: "5.2 mi",
    nextSlot: "Jan 20, 11:00 AM",
    fee: "$180",
    avatar: "JR",
    availableToday: false,
    videoConsult: false,
    experience: "18 years",
  },
  {
    id: 6,
    name: "Dr. Linda Nguyen",
    specialty: "Neurology",
    rating: 4.8,
    reviews: 203,
    location: "Brain & Spine Institute",
    distance: "6.8 mi",
    nextSlot: "Jan 19, 2:00 PM",
    fee: "$225",
    avatar: "LN",
    availableToday: false,
    videoConsult: true,
    experience: "22 years",
  },
]

export default function FindDoctorPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties")

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" || doc.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find a Doctor</h1>
        <p className="text-sm text-muted-foreground">
          Search for specialists and book appointments
        </p>
      </div>

      {/* AI Symptom Checker */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground">
              AI Symptom Checker
            </h3>
            <p className="text-sm text-muted-foreground">
              Describe your symptoms and our AI will recommend the right specialist
            </p>
          </div>
          <Input
            placeholder="e.g., I have chest pain and shortness of breath..."
            className="max-w-md bg-background"
          />
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Check Symptoms
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
              <SelectItem key={s} value={s}>
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
        <Select defaultValue="rating">
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="distance">Nearest</SelectItem>
            <SelectItem value="price-low">Price: Low</SelectItem>
            <SelectItem value="price-high">Price: High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {doctor.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-primary">{doctor.specialty}</p>
                    </div>
                    <span className="text-lg font-bold text-card-foreground">
                      {doctor.fee}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-medium text-card-foreground">
                      {doctor.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({doctor.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    {doctor.location} - {doctor.distance}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Next: {doctor.nextSlot}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {doctor.experience}
                </Badge>
                {doctor.availableToday && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 text-xs border-0">
                    Available Today
                  </Badge>
                )}
                {doctor.videoConsult && (
                  <Badge className="bg-blue-500/10 text-blue-600 text-xs border-0">
                    <Video className="mr-1 h-3 w-3" />
                    Video
                  </Badge>
                )}
              </div>

              <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Stethoscope className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            No doctors found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  )
}
