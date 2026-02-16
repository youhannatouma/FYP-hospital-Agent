"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useDataStore } from "@/hooks/use-data-store"
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
  History,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const { toast } = useToast()
  const { user: clerkUser } = useUser()
  const { getUserById, updateUser } = useDataStore()
  const patient = getUserById("pat-1")

  const [profileData, setProfileData] = useState({
    phone: patient?.phone || "",
    dateOfBirth: patient?.dateOfBirth || "",
    bloodType: patient?.bloodType || "",
    gender: patient?.gender || "",
    address: patient?.address || "",
    emergencyName: patient?.emergencyContact || "",
    emergencyRelation: "Spouse",
    emergencyPhone: patient?.emergencyPhone || "",
    insuranceProvider: patient?.insuranceProvider || "",
    insurancePlan: patient?.insurancePlan || "",
    insuranceMemberId: patient?.insuranceMemberId || "",
  })

  const [allergyList, setAllergyList] = useState<string[]>(patient?.allergies || [])
  const [conditionList, setConditionList] = useState<string[]>(patient?.chronicConditions || [])
  const [newAllergy, setNewAllergy] = useState("")
  const [newCondition, setNewCondition] = useState("")
  
  const [familyHistory, setFamilyHistory] = useState([
    "Father: Heart Disease", "Mother: Type 2 Diabetes", "Grandmother: Hypertension"
  ])
  const [newFamily, setNewFamily] = useState("")
  
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

  const [deviceList, setDeviceList] = useState(connectedDevices)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (patient) {
      setProfileData({
        phone: patient.phone || "",
        dateOfBirth: patient.dateOfBirth || "",
        bloodType: patient.bloodType || "",
        gender: patient.gender || "",
        address: patient.address || "",
        emergencyName: patient.emergencyContact || "",
        emergencyRelation: "Spouse",
        emergencyPhone: patient.emergencyPhone || "",
        insuranceProvider: patient.insuranceProvider || "",
        insurancePlan: patient.insurancePlan || "",
        insuranceMemberId: patient.insuranceMemberId || "",
      })
      setAllergyList(patient.allergies || [])
      setConditionList(patient.chronicConditions || [])
    }
  }, [patient?.id])

  // Alias for compatibility with the existing UI in current turn
  const firstName = (clerkUser?.firstName || patient?.name?.split(" ")[0] || "Patient")
  const lastName = (clerkUser?.lastName || patient?.name?.split(" ").slice(1).join(" ") || "")

  const handleSave = async (section: string) => {
    setLoading(true)
    
    updateUser("pat-1", {
      ...profileData,
      emergencyContact: profileData.emergencyName,
      allergies: allergyList,
      chronicConditions: conditionList
    })

    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Health Profile Synced",
        description: `Your ${section} settings have been saved to your secure medical record.`,
      })
    }, 800)
  }

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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground italic">Settings</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Manage your personal identity, medical history, and clinical preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-auto border">
          <TabsTrigger value="profile">Identity & Contact</TabsTrigger>
          <TabsTrigger value="medical">Clinical History</TabsTrigger>
          <TabsTrigger value="preferences">System Settings</TabsTrigger>
          <TabsTrigger value="privacy">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4 flex flex-col gap-6 animate-in fade-in-50 duration-500">
          {/* Avatar */}
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="flex items-center gap-6 p-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-4 ring-primary/10 transition-all group-hover:ring-primary/20">
                  <AvatarImage src={clerkUser?.imageUrl || patient?.avatar || "/placeholder-user.jpg"} alt={clerkUser?.fullName || patient?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {firstName[0]}{lastName[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground border-2 border-background shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-card-foreground">
                  {clerkUser?.fullName || patient?.name}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground font-medium">Record ID: {patient?.id}</p>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] font-bold uppercase tracking-wider">Verified Patient</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-border text-foreground text-xs font-bold"
                >
                  Update Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2 font-bold">
                <User className="h-5 w-5 text-primary" />
                Personal Information & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  readOnly
                  className="bg-muted focus-visible:ring-0 cursor-default font-medium"
                />
                <p className="text-[10px] text-muted-foreground italic">Syncing from Clerk</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  readOnly
                  className="bg-muted focus-visible:ring-0 cursor-default font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Secure Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clerkUser?.primaryEmailAddress?.emailAddress || patient?.email}
                  readOnly
                  className="bg-muted focus-visible:ring-0 cursor-default font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile Contact</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                  className="font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  className="font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bloodType" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Blood Type</Label>
                <Select
                  value={profileData.bloodType}
                  onValueChange={(val) => setProfileData((p) => ({ ...p, bloodType: val }))}
                >
                  <SelectTrigger id="bloodType" className="font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Legal Gender</Label>
                <Select
                  value={profileData.gender}
                  onValueChange={(val) => setProfileData((p) => ({ ...p, gender: val }))}
                >
                  <SelectTrigger id="gender" className="font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Residential Address</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData((p) => ({ ...p, address: e.target.value }))}
                  className="font-medium"
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground font-bold">
                Emergency Contact (N.O.K)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input
                  value={profileData.emergencyName}
                  onChange={(e) => setProfileData((p) => ({ ...p, emergencyName: e.target.value }))}
                  className="font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <Input
                  value={profileData.emergencyPhone}
                  onChange={(e) => setProfileData((p) => ({ ...p, emergencyPhone: e.target.value }))}
                  className="font-medium"
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground font-bold">
                Healthcare Coverage & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Provider Name</Label>
                <Input
                  value={profileData.insuranceProvider}
                  onChange={(e) => setProfileData((p) => ({ ...p, insuranceProvider: e.target.value }))}
                  className="font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Policy/Plan Type</Label>
                <Input
                  value={profileData.insurancePlan}
                  onChange={(e) => setProfileData((p) => ({ ...p, insurancePlan: e.target.value }))}
                  className="font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Member/Policy Number</Label>
                <Input
                  value={profileData.insuranceMemberId}
                  onChange={(e) => setProfileData((p) => ({ ...p, insuranceMemberId: e.target.value }))}
                  className="font-medium"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 border-t">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold shadow-lg px-8 py-6 h-auto"
              onClick={() => handleSave("personal identity")}
              disabled={loading}
            >
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" /> : <Save className="h-5 w-5" />}
              {loading ? "Syncing Identity..." : "Commit Profile Changes"}
            </Button>
          </div>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical" className="mt-4 flex flex-col gap-6 animate-in fade-in-50 duration-500">
          {/* Chronic Conditions */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2 font-bold">
                <Activity className="h-5 w-5 text-primary" />
                Active Clinical Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {conditionList.length > 0 ? (
                  conditionList.map((disease) => (
                    <Badge key={disease} className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3 py-1 text-xs font-bold gap-2">
                      {disease}
                      <button
                        onClick={() => setConditionList(prev => prev.filter(d => d !== disease))}
                        className="hover:text-amber-800 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No conditions reported.</p>
                )}
              </div>
              <div className="flex items-center gap-2 max-w-sm pt-2">
                <Input
                  placeholder="Add condition (e.g. Asthma)"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCondition.trim()) {
                      setConditionList(prev => [...prev, newCondition.trim()])
                      setNewCondition("")
                    }
                  }}
                  className="font-medium"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (newCondition.trim()) {
                      setConditionList(prev => [...prev, newCondition.trim()])
                      setNewCondition("")
                    }
                  }}
                  className="border-primary/20 text-primary hover:bg-primary/5 font-bold"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2 font-bold">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Allergies & Contraindications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {allergyList.length > 0 ? (
                  allergyList.map((allergy) => (
                    <Badge
                      key={allergy}
                      className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 text-xs font-bold gap-2"
                    >
                      {allergy}
                      <button
                        onClick={() => removeAllergy(allergy)}
                        className="hover:text-destructive/80 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No allergies reported.</p>
                )}
              </div>
              <div className="flex items-center gap-2 max-w-sm pt-2">
                <Input
                  placeholder="Add allergy (e.g. Latex)"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                  className="font-medium"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addAllergy}
                  className="border-destructive/20 text-destructive hover:bg-destructive/5 font-bold"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vaccinations */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2 font-bold">
                <Shield className="h-5 w-5 text-emerald-500" />
                Immunization Registry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="grid grid-cols-3 gap-4 bg-muted/40 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b">
                  <span>Vaccine</span>
                  <span>Administered</span>
                  <span>Next Due</span>
                </div>
                <div className="divide-y divide-border">
                  {vaccinations.map((vax, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 gap-4 px-6 py-4 text-sm hover:bg-muted/20 transition-colors"
                    >
                      <span className="font-bold text-card-foreground">
                        {vax.name}
                      </span>
                      <span className="text-muted-foreground font-medium italic">{vax.dateAdministered}</span>
                      <span className="text-muted-foreground font-medium">
                        {vax.nextDue !== "N/A" ? (
                          <Badge variant="outline" className="text-[10px] font-bold border-border">{vax.nextDue}</Badge>
                        ) : (
                          <span className="text-xs italic opacity-50">Complete</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family History */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2 font-bold">
                <History className="h-5 w-5 text-indigo-500" />
                Hereditary & Family History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {familyHistory.map((item) => (
                  <Badge key={item} variant="outline" className="bg-muted/50 border-border px-3 py-1 text-xs font-bold gap-2">
                    {item}
                    <button
                      onClick={() => setFamilyHistory(prev => prev.filter(f => f !== item))}
                      className="hover:text-muted-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-sm pt-2">
                <Input
                  placeholder="e.g., Father: Cardiac History"
                  value={newFamily}
                  onChange={(e) => setNewFamily(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFamily.trim()) {
                      setFamilyHistory(prev => [...prev, newFamily.trim()])
                      setNewFamily("")
                    }
                  }}
                  className="font-medium"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (newFamily.trim()) {
                      setFamilyHistory(prev => [...prev, newFamily.trim()])
                      setNewFamily("")
                    }
                  }}
                  className="border-indigo-500/20 text-indigo-500 hover:bg-indigo-50 font-bold"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 border-t">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold shadow-lg px-8 py-6 h-auto"
              onClick={() => handleSave("clinical history")}
              disabled={loading}
            >
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" /> : <Save className="h-5 w-5" />}
              {loading ? "Syncing Record..." : "Sync Medical Record"}
            </Button>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-4 flex flex-col gap-6 animate-in fade-in-50 duration-500">
          {/* Language */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2 font-bold">
                <Globe className="h-5 w-5 text-primary" />
                Localization & Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Interface Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="ar">Arabic (UAE)</SelectItem>
                    <SelectItem value="fr">French (FR)</SelectItem>
                    <SelectItem value="es">Spanish (ES)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Regional Timezone</Label>
                <Select defaultValue="pst">
                  <SelectTrigger className="font-medium">
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
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2 font-bold">
                <Bell className="h-5 w-5 text-amber-500" />
                Communication Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-x divide-border">
                <div className="pr-4 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Appointments & Scheduling</h4>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Email Alerts</Label>
                        <Switch
                          checked={notifications.emailAppointment}
                          onCheckedChange={(val) => setNotifications((n) => ({ ...n, emailAppointment: val }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">SMS notifications</Label>
                        <Switch
                          checked={notifications.smsAppointment}
                          onCheckedChange={(val) => setNotifications((n) => ({ ...n, smsAppointment: val }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Native Push</Label>
                        <Switch
                          checked={notifications.pushAppointment}
                          onCheckedChange={(val) => setNotifications((n) => ({ ...n, pushAppointment: val }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Medical Lab Results</h4>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Secure Email</Label>
                        <Switch
                          checked={notifications.emailResults}
                          onCheckedChange={(val) => setNotifications((n) => ({ ...n, emailResults: val }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Mobile Push</Label>
                        <Switch
                          checked={notifications.pushResults}
                          onCheckedChange={(val) => setNotifications((n) => ({ ...n, pushResults: val }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pl-8 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Proactive Reminder Optimization</h4>
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground italic leading-relaxed">Select how far in advance you want to receive appointment reminders from your care team.</p>
                      <Select
                        value={notifications.reminderTiming}
                        onValueChange={(val) => setNotifications((n) => ({ ...n, reminderTiming: val }))}
                      >
                        <SelectTrigger className="w-full font-medium">
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
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Expert Tip</p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">Most patients prefer 24-hour reminders for clinical appointments to ensure adequate travel planning.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Preferences */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2 font-bold">
                <Smartphone className="h-5 w-5 text-indigo-500" />
                Care Assistant (AI) Calibration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Voice Profile</Label>
                <Select defaultValue="female">
                  <SelectTrigger className="font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Serenity (Female)</SelectItem>
                    <SelectItem value="male">Horizon (Male)</SelectItem>
                    <SelectItem value="neutral">Ether (Neutral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interaction Style</Label>
                <Select defaultValue="friendly">
                  <SelectTrigger className="font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Clinical & Objective</SelectItem>
                    <SelectItem value="friendly">Warm & Empathetic</SelectItem>
                    <SelectItem value="concise">Direct & Brief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 border-t">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold shadow-lg px-8 py-6 h-auto"
              onClick={() => handleSave("system preferences")}
              disabled={loading}
            >
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" /> : <Save className="h-5 w-5" />}
              {loading ? "Optimizing..." : "Update System Settings"}
            </Button>
          </div>
        </TabsContent>

        {/* Privacy & Security Tab */}
        <TabsContent value="privacy" className="mt-4 flex flex-col gap-6 animate-in fade-in-50 duration-500">
          {/* Data Sharing */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2 font-bold">
                <Shield className="h-5 w-5 text-primary" />
                Data Governance & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center justify-between group">
                <div>
                  <Label className="text-sm font-bold text-foreground">Inter-Provider Coordination</Label>
                  <p className="text-xs text-muted-foreground font-medium italic">Allow authorized clinicians to access your longitudinal health record</p>
                </div>
                <Switch
                  checked={privacy.shareWithDoctors}
                  onCheckedChange={(val) => setPrivacy((p) => ({ ...p, shareWithDoctors: val }))}
                />
              </div>
              <div className="flex items-center justify-between group border-t pt-4">
                <div>
                  <Label className="text-sm font-bold text-foreground">Insurance Verification</Label>
                  <p className="text-xs text-muted-foreground font-medium italic">Allow your insurance provider to access clinical summaries for claims</p>
                </div>
                <Switch
                  checked={privacy.shareWithInsurance}
                  onCheckedChange={(val) => setPrivacy((p) => ({ ...p, shareWithInsurance: val }))}
                />
              </div>
              <div className="flex items-center justify-between group border-t pt-4">
                <div>
                  <Label className="text-sm font-bold text-foreground">Scientific Research (Anonymized)</Label>
                  <p className="text-xs text-muted-foreground font-medium italic">Contribute de-identified data to genomic and epidemiological studies</p>
                </div>
                <Switch
                  checked={privacy.shareForResearch}
                  onCheckedChange={(val) => setPrivacy((p) => ({ ...p, shareForResearch: val }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground font-bold flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-indigo-500" />
                Access Control & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">Multi-Factor Authentication (MFA)</p>
                  <p className="text-xs text-muted-foreground font-medium italic">
                    Require an additional verification step when accessing from new devices
                  </p>
                </div>
                <Switch
                  checked={privacy.twoFactor}
                  onCheckedChange={(val) => setPrivacy((p) => ({ ...p, twoFactor: val }))}
                />
              </div>
              {privacy.twoFactor && (
                <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">MFA Protocol Active</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connected Devices */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground font-bold">
                Active Session Management
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {deviceList.map((device, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/5 transition-all hover:border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted border border-border">
                      <device.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-card-foreground">{device.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {device.type} • {device.lastActive}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/5 text-xs font-bold"
                    onClick={() => {
                      setDeviceList(prev => prev.filter((_, i) => i !== idx))
                      toast({
                        title: "Session Terminated",
                        description: `${device.name} has been signed out.`,
                      })
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b mb-4">
              <CardTitle className="text-lg text-card-foreground font-bold">
                Account & Data Transparency
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <Button
                  variant="outline"
                  className="w-full sm:w-fit border-slate-300 text-slate-700 bg-white hover:bg-slate-50 gap-2 font-bold shadow-sm"
                  onClick={() => {
                    toast({
                      title: "Preparing Export",
                      description: "Your secure health record archive is being generated.",
                    })
                  }}
                >
                  <Download className="h-4 w-4" />
                  Request Full Health Data Export (PDF/JSON)
                </Button>
              </div>

              <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/10">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-fit border-destructive/30 text-destructive hover:bg-destructive/10 gap-2 font-bold"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deactivate Hospital Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-destructive font-bold text-xl">
                        <AlertTriangle className="h-6 w-6" />
                        Account Deactivation
                      </DialogTitle>
                      <DialogDescription className="pt-2 font-medium leading-relaxed">
                        This action is irreversible. Your medical records, appointment history, and genomic data will be archived according to regulatory requirements, but your active account will be purged.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex gap-2">
                      <Button variant="outline" className="border-border font-bold">Abort Process</Button>
                      <Button variant="destructive" className="font-bold px-6">
                        Confirm Deactivation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 border-t">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold shadow-lg px-8 py-6 h-auto"
              onClick={() => handleSave("security settings")}
              disabled={loading}
            >
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" /> : <Save className="h-5 w-5" />}
              {loading ? "Securing Account..." : "Confirm Security Overhaul"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
