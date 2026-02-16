"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { useDataStore } from "@/hooks/use-data-store"
import { User, ShieldCheck, Bell, Lock, Globe, Moon, Sun, Monitor, Save, Camera, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function DoctorSettingsPage() {
  const { toast } = useToast()
  const { user: clerkUser } = useUser()
  const { getUserById, updateUser } = useDataStore()
  const doctor = getUserById("doc-1")

  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    bio: doctor?.bio || "",
    specialty: doctor?.specialty || "",
    phone: doctor?.phone || "",
    clinicAddress: doctor?.clinicAddress || "",
    yearsOfExperience: doctor?.yearsOfExperience || 0
  })

  React.useEffect(() => {
    if (doctor) {
      setFormData({
        bio: doctor.bio || "",
        specialty: doctor.specialty || "",
        phone: doctor.phone || "",
        clinicAddress: doctor.clinicAddress || "",
        yearsOfExperience: doctor.yearsOfExperience || 0
      })
    }
  }, [doctor?.id])

  const handleSave = (section: string) => {
    setLoading(true)
    
    // Update DB
    updateUser("doc-1", {
      bio: formData.bio,
      specialty: formData.specialty,
      phone: formData.phone,
      clinicAddress: formData.clinicAddress,
      yearsOfExperience: Number(formData.yearsOfExperience)
    })

    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Settings Saved",
        description: `Your ${section} settings have been updated successfully and synced with the clinical database.`,
      })
    }, 800)
  }

  const nameParts = (clerkUser?.fullName || doctor?.name || "Doctor").split(" ")
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(" ")

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm font-medium">Manage your professional identity and clinical environment.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-card shadow-sm"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-card shadow-sm"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2 data-[state=active]:bg-card shadow-sm"><ShieldCheck className="h-4 w-4" /> Privacy & Security</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-card shadow-sm"><Moon className="h-4 w-4" /> Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-6 border-b mb-6">
              <CardTitle className="text-xl">Clinical Profile</CardTitle>
              <CardDescription>This information is visible to patients during searches and booking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-28 w-28 ring-4 ring-primary/10 transition-all group-hover:ring-primary/20">
                    <AvatarImage src={clerkUser?.imageUrl || doctor?.avatar || "/doctor-avatar.jpg"} />
                    <AvatarFallback className="text-3xl font-bold bg-primary/20 text-primary">
                      {firstName[0]}{lastName[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full border-2 border-background shadow-lg hover:scale-110 transition-transform">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-foreground">Dr. {clerkUser?.fullName || doctor?.name}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3">
                      {formData.specialty || "General Medicine"}
                    </Badge>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 font-bold px-3">
                      Verified Provider
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="h-3 w-3" /> {formData.clinicAddress || "Main Clinic"}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    readOnly 
                    className="bg-muted focus-visible:ring-0 cursor-default font-medium"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Managed via Clerk Account</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    readOnly 
                    className="bg-muted focus-visible:ring-0 cursor-default font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      value={clerkUser?.primaryEmailAddress?.emailAddress || doctor?.email} 
                      readOnly 
                      className="pl-10 bg-muted focus-visible:ring-0 cursor-default font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Office Contact</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 font-medium" 
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialization</Label>
                  <Input 
                    id="specialty" 
                    value={formData.specialty} 
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Years of Experience</Label>
                  <Input 
                    id="experience" 
                    type="number"
                    value={formData.yearsOfExperience} 
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                    className="font-medium" 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="clinic" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Practice Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="clinic" 
                      value={formData.clinicAddress} 
                      onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                      className="pl-10 font-medium" 
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Summary</Label>
                  <textarea 
                    id="bio" 
                    rows={4}
                    value={formData.bio} 
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-medium"
                    placeholder="Describe your medical expertise and approach to patient care..."
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex justify-between items-center p-4">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Last updated: {new Date().toLocaleDateString()}</p>
              <Button onClick={() => handleSave("profile")} disabled={loading} className="font-bold shadow-md px-8">
                {loading ? "Syncing..." : "Save Professional Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive alerts and updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">New Appointments</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts when a new patient schedules a visit.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Emergency Flags</Label>
                    <p className="text-sm text-muted-foreground">High-priority alerts for abnormal patient vitals.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Chat Messages</Label>
                    <p className="text-sm text-muted-foreground">Notification for secure messages from patients or staff.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Lab Results</Label>
                    <p className="text-sm text-muted-foreground">Alerts when new diagnostic reports are ready for review.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex justify-end p-4">
              <Button onClick={() => handleSave("notifications")}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>Manage your security settings and data access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <Button variant="outline" className="justify-start gap-3 h-12 w-full sm:w-auto">
                  <Lock className="h-4 w-4" /> Change Password
                </Button>
                <Button variant="outline" className="justify-start gap-3 h-12 w-full sm:w-auto">
                  <Monitor className="h-4 w-4" /> Managed Sessions (3 Active)
                </Button>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">AI Data Contribution</Label>
                    <p className="text-sm text-muted-foreground">Allow anonymized clinical data to improve AI diagnostic aids.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Interface Appearance</CardTitle>
              <CardDescription>Customize how the dashboard looks and feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
