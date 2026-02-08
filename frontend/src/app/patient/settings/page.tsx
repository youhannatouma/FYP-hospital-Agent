"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  User,
  Camera,
  Save,
  Shield,
  Bell,
  Globe,
  Smartphone,
  Monitor,
  Trash2,
  Download,
  X,
  Plus,
  AlertTriangle,
} from "lucide-react"

const allergies = ["Penicillin", "Sulfa Drugs", "Latex"]
const chronicDiseases = ["Hypertension", "Hyperlipidemia"]

const vaccinations = [
  { name: "COVID-19 (Pfizer)", dateAdministered: "Sep 15, 2023", nextDue: "Sep 15, 2024" },
  { name: "Influenza", dateAdministered: "Oct 1, 2023", nextDue: "Oct 1, 2024" },
  { name: "Tdap", dateAdministered: "Mar 10, 2020", nextDue: "Mar 10, 2030" },
  { name: "Hepatitis B", dateAdministered: "Jan 5, 2018", nextDue: "N/A" },
]

const connectedDevices = [
  { name: "iPhone 15 Pro", type: "Mobile", lastActive: "Active now", icon: Smartphone },
  { name: "MacBook Pro", type: "Desktop", lastActive: "2 hours ago", icon: Monitor },
  { name: "iPad Air", type: "Tablet", lastActive: "3 days ago", icon: Smartphone },
]

export default function SettingsPage() {
  const [profileData, setProfileData] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    dateOfBirth: "1982-03-15",
    bloodType: "O+",
    gender: "Female",
    address: "456 Elm Street, Suite 12, San Francisco, CA 94102",
    emergencyName: "John Johnson",
    emergencyRelation: "Spouse",
    emergencyPhone: "(555) 987-6543",
    insuranceProvider: "BlueCross BlueShield",
    insurancePlan: "Premium Health Plus",
    insuranceMemberId: "BCB-4521-8837",
  })

  const [notifications, setNotifications] = useState({
    emailAppointment: true,
    smsAppointment: true,
    pushAppointment: true,
    emailResults: true,
    smsResults: false,
    pushResults: true,
    emailMessages: true,
    smsMessages: false,
    pushMessages: true,
    reminderTiming: "24h",
  })

  const [privacy, setPrivacy] = useState({
    shareWithDoctors: true,
    shareWithInsurance: true,
    shareForResearch: false,
    twoFactor: true,
  })

  const [allergyList, setAllergyList] = useState(allergies)
  const [newAllergy, setNewAllergy] = useState("")

  const addAllergy = () => {
    if (newAllergy.trim() && !allergyList.includes(newAllergy.trim())) {
      setAllergyList((prev) => [...prev, newAllergy.trim()])
      setNewAllergy("")
    }
  }

  const removeAllergy = (allergy: string) => {
    setAllergyList((prev) => prev.filter((a) => a !== allergy))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, medical history, and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-muted flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4 flex flex-col gap-6">
          {/* Avatar */}
          <Card className="border border-border bg-card">
            <CardContent className="flex items-center gap-6 p-6">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                  <AvatarImage src="/placeholder-user.jpg" alt="Sarah Johnson" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    SJ
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground"
                >
                  <Camera className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">Patient ID: P-1842</p>
                <Button variant="outline" size="sm" className="mt-2 border-border text-foreground text-xs">
                  Change Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName" className="text-sm text-foreground">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName" className="text-sm text-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="text-sm text-foreground">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dob" className="text-sm text-foreground">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bloodType" className="text-sm text-foreground">Blood Type</Label>
                <Select
                  value={profileData.bloodType}
                  onValueChange={(val) => setProfileData((p) => ({ ...p, bloodType: val }))}
                >
                  <SelectTrigger id="bloodType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gender" className="text-sm text-foreground">Gender</Label>
                <Select
                  value={profileData.gender}
                  onValueChange={(val) => setProfileData((p) => ({ ...p, gender: val }))}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="address" className="text-sm text-foreground">Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Name</Label>
                <Input
                  value={profileData.emergencyName}
                  onChange={(e) => setProfileData((p) => ({ ...p, emergencyName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Relationship</Label>
                <Input
                  value={profileData.emergencyRelation}
                  onChange={(e) => setProfileData((p) => ({ ...p, emergencyRelation: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Phone</Label>
                <Input
                  value={profileData.emergencyPhone}
                  onChange={(e) => setProfileData((p) => ({ ...p, emergencyPhone: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                Insurance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Provider</Label>
                <Input
                  value={profileData.insuranceProvider}
                  onChange={(e) => setProfileData((p) => ({ ...p, insuranceProvider: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Plan</Label>
                <Input
                  value={profileData.insurancePlan}
                  onChange={(e) => setProfileData((p) => ({ ...p, insurancePlan: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Member ID</Label>
                <Input
                  value={profileData.insuranceMemberId}
                  onChange={(e) => setProfileData((p) => ({ ...p, insuranceMemberId: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-fit bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical" className="mt-4 flex flex-col gap-6">
          {/* Chronic Diseases */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                Chronic Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {chronicDiseases.map((disease) => (
                  <Badge key={disease} className="bg-amber-500/10 text-amber-600 border-0 text-sm">
                    {disease}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="h-7 border-border text-foreground text-xs gap-1">
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {allergyList.map((allergy) => (
                  <Badge
                    key={allergy}
                    className="bg-destructive/10 text-destructive border-0 text-sm gap-1"
                  >
                    {allergy}
                    <button
                      onClick={() => removeAllergy(allergy)}
                      className="ml-1 hover:text-destructive/80"
                      aria-label={`Remove ${allergy}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add new allergy..."
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                  className="max-w-xs"
                />
                <Button
                  size="sm"
                  onClick={addAllergy}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vaccinations */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                Vaccination History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-3 gap-4 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
                  <span>Vaccine</span>
                  <span>Date Administered</span>
                  <span>Next Dose Due</span>
                </div>
                {vaccinations.map((vax, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-4 px-4 py-2.5 text-sm border-t border-border"
                  >
                    <span className="font-medium text-card-foreground">
                      {vax.name}
                    </span>
                    <span className="text-muted-foreground">{vax.dateAdministered}</span>
                    <span className="text-muted-foreground">{vax.nextDue}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Family History */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                Family Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-sm">Father: Heart Disease</Badge>
                <Badge variant="secondary" className="text-sm">Mother: Type 2 Diabetes</Badge>
                <Badge variant="secondary" className="text-sm">Grandmother: Hypertension</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-fit border-border text-foreground text-xs gap-1">
                <Plus className="h-3 w-3" />
                Add Family History
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-4 flex flex-col gap-6">
          {/* Language */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Timezone</Label>
                <Select defaultValue="pst">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Appointments</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Email notifications</Label>
                      <Switch
                        checked={notifications.emailAppointment}
                        onCheckedChange={(val) => setNotifications((n) => ({ ...n, emailAppointment: val }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">SMS notifications</Label>
                      <Switch
                        checked={notifications.smsAppointment}
                        onCheckedChange={(val) => setNotifications((n) => ({ ...n, smsAppointment: val }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Push notifications</Label>
                      <Switch
                        checked={notifications.pushAppointment}
                        onCheckedChange={(val) => setNotifications((n) => ({ ...n, pushAppointment: val }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Lab Results</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Email notifications</Label>
                      <Switch
                        checked={notifications.emailResults}
                        onCheckedChange={(val) => setNotifications((n) => ({ ...n, emailResults: val }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">Push notifications</Label>
                      <Switch
                        checked={notifications.pushResults}
                        onCheckedChange={(val) => setNotifications((n) => ({ ...n, pushResults: val }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Reminder Timing</h4>
                  <Select
                    value={notifications.reminderTiming}
                    onValueChange={(val) => setNotifications((n) => ({ ...n, reminderTiming: val }))}
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour before</SelectItem>
                      <SelectItem value="3h">3 hours before</SelectItem>
                      <SelectItem value="24h">24 hours before</SelectItem>
                      <SelectItem value="48h">48 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Preferences */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                AI Assistant Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Voice Type</Label>
                <Select defaultValue="female">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-foreground">Communication Style</Label>
                <Select defaultValue="friendly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button className="w-fit bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
        </TabsContent>

        {/* Privacy & Security Tab */}
        <TabsContent value="privacy" className="mt-4 flex flex-col gap-6">
          {/* Data Sharing */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Data Sharing Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-foreground">Share with Doctors</Label>
                  <p className="text-xs text-muted-foreground">Allow your doctors to access your health data</p>
                </div>
                <Switch
                  checked={privacy.shareWithDoctors}
                  onCheckedChange={(val) => setPrivacy((p) => ({ ...p, shareWithDoctors: val }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-foreground">Share with Insurance</Label>
                  <p className="text-xs text-muted-foreground">Allow insurance provider to access claims data</p>
                </div>
                <Switch
                  checked={privacy.shareWithInsurance}
                  onCheckedChange={(val) => setPrivacy((p) => ({ ...p, shareWithInsurance: val }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-foreground">Anonymized Research</Label>
                  <p className="text-xs text-muted-foreground">Contribute anonymized data to medical research</p>
                </div>
                <Switch
                  checked={privacy.shareForResearch}
                  onCheckedChange={(val) => setPrivacy((p) => ({ ...p, shareForResearch: val }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable 2FA</p>
                  <p className="text-xs text-muted-foreground">
                    Add extra security to your account with two-factor authentication
                  </p>
                </div>
                <Switch
                  checked={privacy.twoFactor}
                  onCheckedChange={(val) => setPrivacy((p) => ({ ...p, twoFactor: val }))}
                />
              </div>
              {privacy.twoFactor && (
                <Badge className="mt-3 bg-emerald-500/10 text-emerald-600 border-0">
                  2FA is active
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Connected Devices */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                Connected Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {connectedDevices.map((device, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <device.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{device.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {device.type} - {device.lastActive}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-card-foreground">
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button variant="outline" className="w-fit border-border text-foreground gap-2">
                <Download className="h-4 w-4" />
                Download My Data
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-fit border-destructive/30 text-destructive hover:bg-destructive/10 gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Account
                    </DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers, including medical records,
                      appointments, and messages.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" className="border-border text-foreground">Cancel</Button>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
