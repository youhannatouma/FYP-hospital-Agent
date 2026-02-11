"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { 
  User, 
  MapPin, 
  Phone, 
  Droplet, 
  Stethoscope, 
  AlertCircle, 
  Pill, 
  History,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Plus,
  Trash2,
  ShieldCheck,
  Languages,
  Bell,
  Sparkles,
  Calendar,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// Steps: 
// 1. Account (Completed via Clerk)
// 2. Verification (Completed via Clerk)
// 3. Personal Info
// 4. Medical History
// 5. Preferences
// 6. Success

export default function PatientOnboarding() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [step, setStep] = React.useState(3)
  const [progress, setProgress] = React.useState(60)

  // Form State
  const [formData, setFormData] = React.useState({
    dob: "",
    gender: "",
    bloodType: "",
    phone: "",
    address: { street: "", city: "", state: "", zip: "" },
    emergencyContact: { name: "", phone: "" },
    chronicDiseases: [] as string[],
    allergies: { drug: [] as string[], food: [] as string[], env: [] as string[] },
    medications: [] as { name: string, dosage: string, freq: string }[],
    insurance: { provider: "", policy: "" },
    language: "English",
    notifications: ["Email"],
    doctorGender: "No Preference"
  })

  // Helper to update progress
  React.useEffect(() => {
    setProgress((step / 5) * 100)
  }, [step])

  const nextStep = () => setStep(prev => Math.min(prev + 1, 6))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 3))

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 md:p-12">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header & Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Activity className="h-6 w-6" />
              <span className="font-black tracking-tighter text-xl">Care</span>
            </div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Step {step} of 5
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-muted transition-all duration-500" />
        </div>

        <AnimatePresence mode="wait">
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Personal Details</h1>
                <p className="text-muted-foreground">This information helps us tailor your health dashboard.</p>
              </div>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" /> Date of Birth
                      </Label>
                      <Input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Gender</Label>
                      <Select value={formData.gender} onValueChange={val => setFormData({...formData, gender: val})}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="private">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-destructive" /> Blood Type
                      </Label>
                      <Select value={formData.bloodType} onValueChange={val => setFormData({...formData, bloodType: val})}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" /> Phone Number
                      </Label>
                      <Input placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-11" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <Label className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" /> Residential Address
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Street Address" className="rounded-xl h-11" />
                      <Input placeholder="City" className="rounded-xl h-11" />
                      <Input placeholder="State / Province" className="rounded-xl h-11" />
                      <Input placeholder="Postal Code" className="rounded-xl h-11" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <Label className="text-lg font-bold">Emergency Contact</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Full Name" className="rounded-xl h-11" />
                      <Input placeholder="Phone Number" className="rounded-xl h-11" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" className="font-bold h-12 px-8" disabled>
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={nextStep} className="bg-primary font-bold h-12 px-12 rounded-xl shadow-lg shadow-primary/20">
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Medical History</h1>
                <p className="text-muted-foreground">This helps doctors provide accurate and personalized care.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" /> Chronic Conditions
                    </CardTitle>
                    <CardDescription>Check any that apply to you</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid", "Arthritis"].map(item => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox id={item} />
                        <label htmlFor={item} className="text-sm font-medium leading-none cursor-pointer">{item}</label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 col-span-full">
                      <Input placeholder="Other conditions..." className="h-9 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" /> Allergies
                    </CardTitle>
                    <CardDescription>Medications, food, or environmental</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Drug Allergies</Label>
                      <Input placeholder="e.g. Penicillin, Aspirin" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Food Allergies</Label>
                      <Input placeholder="e.g. Peanuts, Shellfish" className="rounded-xl h-11" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-teal-500" /> Current Medications
                      </CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full h-8 px-4 gap-1">
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                      <p className="text-sm text-muted-foreground">No medications added yet</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep} className="font-bold h-12 px-8">
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={nextStep} className="font-bold h-12 px-8 text-muted-foreground">Skip for now</Button>
                  <Button onClick={nextStep} className="bg-primary font-bold h-12 px-12 rounded-xl shadow-lg">
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Preferences & Habits</h1>
                <p className="text-muted-foreground">Personalize how you experience the platform.</p>
              </div>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="font-bold flex items-center gap-2 h-5">
                        <Languages className="h-4 w-4 text-primary" /> Preferred Language
                      </Label>
                      <Select defaultValue="English">
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="font-bold flex items-center gap-2 h-5">
                        <Bell className="h-4 w-4 text-primary" /> Notifications
                      </Label>
                      <div className="flex flex-wrap gap-4">
                        {["Email", "SMS", "Push"].map(mode => (
                          <div key={mode} className="flex items-center space-x-2">
                            <Checkbox id={mode} defaultChecked={mode === "Email"} />
                            <label htmlFor={mode} className="text-sm font-medium">{mode}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-bold">Insurance Information (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Insurance Provider" className="rounded-xl h-11" />
                      <Input placeholder="Policy Number" className="rounded-xl h-11" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <Label className="font-bold">Lifestyle Questions</Label>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-muted-foreground">Physical Exercise Frequency</span>
                        <div className="grid grid-cols-4 gap-2">
                          {["Daily", "Weekly", "Rarely", "Never"].map(freq => (
                            <Button key={freq} variant="outline" className="rounded-xl h-10 text-xs font-bold border-border/50 hover:border-primary">
                              {freq}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep} className="font-bold h-12 px-8">
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={nextStep} className="bg-primary font-bold h-12 px-12 rounded-xl shadow-xl shadow-primary/20">
                  Complete Profile <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div 
              key="step-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12 space-y-8"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative h-24 w-24 rounded-full bg-primary flex items-center justify-center mx-auto shadow-2xl shadow-primary/40">
                  <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight">Welcome, {user?.firstName || "Friend"}!</h1>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  Your profile is complete and your health journey with AI begins now.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: Stethoscope, title: "Find Doctors", desc: "AI-matched just for you" },
                  { icon: Sparkles, title: "AI Health", desc: "24/7 symptom checks" },
                  { icon: Calendar, title: "Book Fast", desc: "Instant slot booking" }
                ].map((item, i) => (
                  <Card key={i} className="bg-card/50 border-border/50 text-left p-4">
                    <item.icon className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={() => router.push("/patient")}
                className="w-full max-w-xs h-14 text-lg font-bold rounded-2xl bg-primary shadow-xl shadow-primary/30 group"
              >
                Go to Dashboard
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
