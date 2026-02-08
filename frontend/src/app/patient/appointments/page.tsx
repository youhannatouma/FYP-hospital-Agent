import { Calendar, Clock, MapPin, Video, MoreHorizontal, FileText, Plus } from "lucide-react"
//random comment

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AppointmentsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Book Appointment
          </Button>
        </div>
      </div>
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                Manage your scheduled appointments.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {/* Appointment Card 1 */}
              <div className="flex items-start justify-between rounded-lg border p-4">
                 <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="/doctors/dr-sarah.jpg" alt="@drsarah" />
                        <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <h3 className="font-semibold">Dr. Sarah Smith</h3>
                        <p className="text-sm text-muted-foreground">Cardiologist • General Consultation</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Today, Feb 06</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>2:00 PM - 2:30 PM</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                <Video className="mr-1 h-3 w-3" /> Video Call
                            </Badge>
                             <Badge variant="secondary">Confirmed</Badge>
                        </div>
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <Button size="sm" variant="default">Join Call</Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem>Add to Calendar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel Appointment</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </div>

               {/* Appointment Card 2 */}
               <div className="flex items-start justify-between rounded-lg border p-4">
                 <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="/doctors/dr-mike.jpg" alt="@drmike" />
                        <AvatarFallback>MR</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <h3 className="font-semibold">Dr. Michael Ross</h3>
                        <p className="text-sm text-muted-foreground">Dermatologist • Skin Screening</p>
                         <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Wed, Feb 12</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>10:30 AM - 11:00 AM</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                <MapPin className="mr-1 h-3 w-3" /> In-Person
                            </Badge>
                             <Badge variant="secondary">Confirmed</Badge>
                        </div>
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem>Add to Calendar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel Appointment</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
           {/* Reuse structure for past appointments */}
           <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>
                View history and follow-up notes.
              </CardDescription>
            </CardHeader>
             <CardContent className="grid gap-6">
                <div className="flex items-start justify-between rounded-lg border p-4 opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback>JL</AvatarFallback>
                        </Avatar>
                         <div className="grid gap-1">
                            <h3 className="font-semibold">Dr. Jennifer Lee</h3>
                            <p className="text-sm text-muted-foreground">Pediatrician • Yearly Checkup</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Jan 15, 2024</span>
                                </div>
                            </div>
                             <Badge variant="secondary" className="mt-2 w-fit">Completed</Badge>
                        </div>
                    </div>
                     <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                            <FileText className="h-3 w-3" /> View Notes
                        </Button>
                    </div>
                </div>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
