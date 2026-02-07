import { Star, MapPin, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Smith",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 124,
    experience: "12 years",
    location: "Central Heart Clinic",
    availability: "Available Today",
    image: "/doctors/dr-sarah.jpg",
    tags: ["Heart Failure", "Hypertension", "Angioplasty"],
  },
  {
    id: 2,
    name: "Dr. Michael Ross",
    specialty: "Dermatologist",
    rating: 4.8,
    reviews: 89,
    experience: "8 years",
    location: "Skin Care Center",
    availability: "Next slots: Tomorrow",
    image: "/doctors/dr-mike.jpg",
    tags: ["Acne", "Dermatitis", "Cosmetic Surgery"],
  },
  {
    id: 3,
    name: "Dr. Emily Chen",
    specialty: "Pediatrician",
    rating: 5.0,
    reviews: 215,
    experience: "15 years",
    location: "City Children Hospital",
    availability: "Available Today",
    image: "/doctors/dr-emily.jpg",
    tags: ["Newborn Care", "Vaccination", "Growth Monitoring"],
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Neurologist",
    rating: 4.7,
    reviews: 76,
    experience: "20 years",
    location: "Neuro Science Institute",
    availability: "Next slots: Feb 12",
    image: "/doctors/dr-james.jpg",
    tags: ["Migraine", "Epilepsy", "Stroke Recovery"],
  },
  {
    id: 5,
    name: "Dr. Linda Taylor",
    specialty: "Psychiatrist",
    rating: 4.9,
    reviews: 150,
    experience: "10 years",
    location: "Mind Wellness Clinic",
    availability: "Available Today",
    image: "/doctors/dr-linda.jpg",
    tags: ["Anxiety", "Depression", "Therapy"],
  },
  {
    id: 6,
    name: "Dr. Robert Brown",
    specialty: "Orthopedic Surgeon",
    rating: 4.6,
    reviews: 98,
    experience: "18 years",
    location: "Joint & Bone Center",
    availability: "Next slots: Feb 14",
    image: "/doctors/dr-robert.jpg",
    tags: ["Sports Injury", "Joint Replacement", "Arthritis"],
  },
]

export default function DoctorsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-start justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Find Doctors</h2>
            <p className="text-muted-foreground mt-2">
                Book appointments with top specialists in your area.
            </p>
        </div>
      </div>

      <div className="flex items-center gap-4 py-4">
        <Input placeholder="Search doctors, specialities, symptoms..." className="max-w-sm" />
        <Button variant="outline">Filters</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden flex flex-col">
            <CardHeader className="p-0">
               <div className="bg-muted h-32 w-full relative">
                   {/* Cover pattern or solid color */}
               </div>
               <div className="px-6 relative -mt-12 flex justify-between items-end">
                    <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={doctor.image} alt={doctor.name} />
                        <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Badge variant={doctor.availability.includes("Today") ? "default" : "secondary"} className="mb-2">
                        {doctor.availability.includes("Today") ? "Available Today" : "Next Available"}
                    </Badge>
               </div>
            </CardHeader>
            <CardContent className="grid gap-2 p-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-bold">{doctor.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{doctor.specialty}</p>
                 </div>
                 <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-xs font-bold text-yellow-700 dark:text-yellow-400">
                    <Star className="h-3 w-3 fill-yellow-500" />
                    {doctor.rating}
                 </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <MapPin className="h-4 w-4" />
                {doctor.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {doctor.experience} Experience
              </div>

               <div className="flex flex-wrap gap-2 mt-4">
                  {doctor.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs font-normal">
                          {tag}
                      </Badge>
                  ))}
               </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 mt-auto grid gap-2">
               <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" /> Book Appointment
               </Button>
               <Button variant="outline" className="w-full">View Profile</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
