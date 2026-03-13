"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { User, Bell, ShieldCheck, Stethoscope, Camera } from "lucide-react"
import { m } from "framer-motion"

export default function DoctorSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [patientMessages, setPatientMessages] = useState(true)
  const [twoFA, setTwoFA] = useState(false)

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Your profile settings have been updated." })
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
                Professional Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                    <AvatarImage src="/doctor-avatar.jpg" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      JS
                    </AvatarFallback>
                  </Avatar>
                  <button
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    onClick={() => toast({ title: "Upload Photo", description: "Photo upload coming soon." })}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Dr. John Smith</p>
                  <p className="text-sm text-muted-foreground">Cardiologist · MD</p>
                  <p className="text-sm text-primary">john.smith@hospital.com</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Smith" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input id="specialty" defaultValue="Cardiology" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="licenseNo">License Number</Label>
                  <Input id="licenseNo" defaultValue="MD-2024-7821" />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Board-certified Cardiologist with 15 years of experience in interventional cardiology and heart failure management."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {[
                { id: "email", label: "Email Notifications", description: "Receive summaries and alerts by email.", value: emailNotifications, onChange: setEmailNotifications },
                { id: "appt", label: "Appointment Reminders", description: "Get notified 30 minutes before each appointment.", value: appointmentReminders, onChange: setAppointmentReminders },
                { id: "msg", label: "Patient Messages", description: "Receive a notification for new patient messages.", value: patientMessages, onChange: setPatientMessages },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{pref.label}</p>
                    <p className="text-sm text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch
                    id={pref.id}
                    checked={pref.value}
                    onCheckedChange={(v) => { pref.onChange(v); toast({ title: pref.label, description: v ? "Enabled" : "Disabled" }) }}
                  />
                </div>
              ))}
              <Separator />
              <div className="flex justify-end">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4">
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-foreground">Change Password</h3>
                <div className="grid grid-cols-1 gap-4 sm:max-w-md">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="currentPwd">Current Password</Label>
                    <Input id="currentPwd" type="password" placeholder="••••••••" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="newPwd">New Password</Label>
                    <Input id="newPwd" type="password" placeholder="••••••••" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirmPwd">Confirm New Password</Label>
                    <Input id="confirmPwd" type="password" placeholder="••••••••" />
                  </div>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 w-fit"
                    onClick={() => toast({ title: "Password Updated", description: "Your password has been changed." })}
                  >
                    Update Password
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Switch
                  checked={twoFA}
                  onCheckedChange={(v) => { setTwoFA(v); toast({ title: "2FA", description: v ? "Two-factor authentication enabled." : "Two-factor authentication disabled." }) }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </m.div>
  )
}
