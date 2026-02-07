import { CalendarDays, FileText, Pill, Activity, ArrowRight, Video } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function PatientDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointment
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today, 2:00 PM</div>
            <p className="text-xs text-muted-foreground">
              Dr. Sarah Smith - Cardiologist
            </p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Prescriptions
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Active</div>
            <p className="text-xs text-muted-foreground">
              2 refills available
            </p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              New results attached
            </p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center overflow-hidden">
            <div className="grid gap-2">
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>
                You have 3 appointments this month.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <a href="/patient/appointments">
                View All
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
                {/* Appointment Item 1 */}
                <div className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <Video className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Remote Consultation</p>
                        <p className="text-sm text-muted-foreground">
                            Dr. Emily Chen • General Medicine
                        </p>
                    </div>
                    <div className="ml-auto font-medium">Today, 2:00 PM</div>
                </div>

                 {/* Appointment Item 2 */}
                <div className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Annual Checkup</p>
                        <p className="text-sm text-muted-foreground">
                            Dr. Michael Ross • Cardiology
                        </p>
                    </div>
                    <div className="ml-auto font-medium">Feb 12, 10:30 AM</div>
                </div>

                 {/* Appointment Item 3 */}
                <div className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                        <Activity className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Lab Results Review</p>
                        <p className="text-sm text-muted-foreground">
                            Lab Corp • Haematology
                        </p>
                    </div>
                    <div className="ml-auto font-medium">Feb 15, 09:00 AM</div>
                </div>
            </div>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-5">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="flex items-center gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Prescription Refilled
                </p>
                <p className="text-sm text-muted-foreground">
                    Amoxicillin 500mg
                </p>
              </div>
              <div className="ml-auto font-medium text-xs text-muted-foreground">2h ago</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  New Test Result
                </p>
                <p className="text-sm text-muted-foreground">
                  Blood Panel - Complete
                </p>
              </div>
              <div className="ml-auto font-medium text-xs text-muted-foreground">5h ago</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Appointment Booked
                </p>
                <p className="text-sm text-muted-foreground">
                  With Dr. Sarah Smith
                </p>
              </div>
              <div className="ml-auto font-medium text-xs text-muted-foreground">1d ago</div>
            </div>
            <div className="flex items-center gap-4">
                <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                        Profile Updated
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Insurance details verified
                    </p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground">2d ago</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
