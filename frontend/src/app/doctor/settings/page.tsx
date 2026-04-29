"use client"

import { useState, useEffect } from "react"
import { useUser, useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { User, ShieldCheck, Stethoscope, Camera, Loader2, Plus, Trash2 } from "lucide-react"
import { m } from "framer-motion"
import { useHospital } from "@/hooks/use-hospital"
import { Badge } from "@/components/ui/badge"

export default function DoctorSettingsPage() {
  const { user, isLoaded: isClerkLoaded } = useUser()
  const { getToken } = useAuth()
  const { admin } = useHospital()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    specialty: "",
    license_number: "",
    years_of_experience: "",
    phone_number: "",
    clinic_address: "",
    qualifications: [] as string[],
    newQual: ""
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isClerkLoaded) return
      try {
        const token = await getToken()
        const data = await admin.getMe(token || undefined)
        if (data) {
          setFormData({
            specialty: data.specialty || "",
            license_number: data.license_number || "",
            years_of_experience: data.years_of_experience?.toString() || "",
            phone_number: data.phone_number || "",
            clinic_address: data.clinic_address || "",
            qualifications: data.qualifications || [],
            newQual: ""
          })
        }
      } catch (error) {
        console.error("Failed to fetch doctor profile:", error)
        toast({ title: "Error", description: "Failed to load profile data.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [isClerkLoaded, admin, getToken, toast])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = await getToken()
      const updateData = {
        specialty: formData.specialty,
        license_number: formData.license_number,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
        phone_number: formData.phone_number,
        clinic_address: formData.clinic_address,
        qualifications: formData.qualifications
      }
      await admin.updateMe(updateData, token || undefined)
      toast({ title: "Settings Saved", description: "Your professional profile has been updated." })
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({ title: "Update Failed", description: "Could not save profile changes.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const addQual = () => {
    if (formData.newQual.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, formData.newQual.trim()],
        newQual: ""
      })
    }
  }

  const removeQual = (index: number) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index)
    })
  }

  if (!isClerkLoaded || isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <m.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Professional Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your clinical credentials and practice details</p>
        </div>
        <Button 
          className="bg-primary shadow-lg shadow-primary/20" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="profile" className="gap-1.5 rounded-lg px-4">
            <User className="h-4 w-4" />
            Identity
          </TabsTrigger>
          <TabsTrigger value="credentials" className="gap-1.5 rounded-lg px-4">
            <Stethoscope className="h-4 w-4" />
            Professional
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 rounded-lg px-4">
            <ShieldCheck className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden bg-card">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Identity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-primary/10 shadow-inner-glow">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-foreground tracking-tight">{user?.fullName}</h3>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase text-[10px]">
                      Verified Physician
                    </Badge>
                  </p>
                  <p className="text-xs text-primary font-bold opacity-80">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">First Name</Label>
                  <Input value={user?.firstName || ""} disabled className="rounded-xl h-12 bg-muted/30 border-border/50 italic" />
                  <p className="text-[10px] text-muted-foreground">Update via your primary account provider</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Last Name</Label>
                  <Input value={user?.lastName || ""} disabled className="rounded-xl h-12 bg-muted/30 border-border/50 italic" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="mt-6">
          <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden bg-card">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" /> Professional Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Medical Specialty</Label>
                  <Input 
                    value={formData.specialty} 
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    placeholder="e.g. Cardiology" 
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">License Number</Label>
                  <Input 
                    value={formData.license_number} 
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    placeholder="e.g. MD-2024-X" 
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Years of Experience</Label>
                  <Input 
                    type="number"
                    value={formData.years_of_experience} 
                    onChange={(e) => setFormData({...formData, years_of_experience: e.target.value})}
                    placeholder="e.g. 15" 
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Practice Phone</Label>
                  <Input 
                    value={formData.phone_number} 
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="+1 (555) 000-0000" 
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Clinic Address</Label>
                  <Textarea 
                    value={formData.clinic_address} 
                    onChange={(e) => setFormData({...formData, clinic_address: e.target.value})}
                    placeholder="Enter your primary clinic or hospital address" 
                    className="rounded-xl min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Qualifications & Certifications</Label>
                <div className="flex gap-2 flex-wrap min-h-[48px] p-4 rounded-xl bg-muted/20 border border-border/50">
                  {formData.qualifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No qualifications added yet</p>
                  ) : (
                    formData.qualifications.map((q, i) => (
                      <Badge key={i} variant="secondary" className="gap-2 py-1.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                        {q}
                        <button onClick={() => removeQual(i)} className="text-destructive hover:scale-125 transition-transform"><Trash2 className="h-3 w-3" /></button>
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input 
                    value={formData.newQual} 
                    onChange={(e) => setFormData({...formData, newQual: e.target.value})}
                    placeholder="e.g. MBBS, board certification..." 
                    className="rounded-xl h-12 flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addQual()}
                  />
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={addQual}>
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="premium-card rounded-[2rem] border-none shadow-premium overflow-hidden bg-card">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Authentication Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6 text-center">
              <div className="py-12 bg-muted/30 rounded-[2rem] border border-dashed border-border/50">
                <ShieldCheck className="h-16 w-16 text-primary mx-auto opacity-20 mb-4" />
                <h3 className="text-lg font-black tracking-tight mb-2">Manage Secure Credentials</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
                  Authentication settings including passwords and multi-factor security are managed through your primary account provider.
                </p>
                <Button variant="outline" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest border-border/50" onClick={() => window.open('https://accounts.clerk.dev', '_blank')}>
                  Go to Security Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </m.div>
  )
}
