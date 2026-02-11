"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { 
  Activity,
  Upload, 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Plus,
  GraduationCap,
  Award,
  Globe,
  Camera,
  ShieldCheck,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent,} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function DoctorOnboarding() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [step, setStep] = React.useState(2)
  const [progress, setProgress] = React.useState(20)

  // Progress logic
  React.useEffect(() => {
    setProgress((step / 7) * 100)
  }, [step])

  const nextStep = () => setStep(prev => Math.min(prev + 1, 7))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 2))

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
              Step {step} of 7
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-muted rounded-full" />
        </div>

        <AnimatePresence mode="wait">
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Professional Credentials</h1>
                <p className="text-muted-foreground">Tell us about your medical background and expertise.</p>
              </div>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Medical License Number</Label>
                      <Input placeholder="ML-88220033" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Specialization</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select Specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gp">General Practitioner</SelectItem>
                          <SelectItem value="cardio">Cardiologist</SelectItem>
                          <SelectItem value="derm">Dermatologist</SelectItem>
                          <SelectItem value="pedia">Pediatrician</SelectItem>
                          <SelectItem value="psych">Psychiatrist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Years of Experience</Label>
                      <Input type="number" placeholder="e.g. 10" className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Medical School</Label>
                      <Input placeholder="Johns Hopkins University" className="rounded-xl h-11" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <Label className="text-lg font-bold flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" /> Board Certifications
                    </Label>
                    <div className="space-y-2">
                      <Input placeholder="Add certification (e.g. American Board of Internal Medicine)" className="rounded-xl h-11" />
                      <p className="text-xs text-muted-foreground italic">Add multiple certifications separate by commas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" disabled className="font-bold h-12 px-8">
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={nextStep} className="bg-primary font-bold h-12 px-12 rounded-xl shadow-lg">
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Verify Your Credentials</h1>
                <p className="text-muted-foreground">Upload clear scans of your documents for verification.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Medical License", icon: FileText },
                  { label: "Professional ID", icon: ShieldCheck },
                  { label: "Medical Degree", icon: GraduationCap },
                  { label: "Certifications", icon: Award }
                ].map((doc, i) => (
                  <Card key={i} className="border-border/50 bg-card/50 hover:border-primary/50 transition-colors border-dashed border-2 group cursor-pointer">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <doc.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{doc.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full h-8 px-4 gap-1">
                        <Upload className="h-3 w-3" /> Upload
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-600">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">
                  Documents are reviewed by our medical board within 24-48 hours. Please ensure all text is legible.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep} className="font-bold h-12 px-8">
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={nextStep} className="bg-primary font-bold h-12 px-12 rounded-xl shadow-lg">
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
                <h1 className="text-3xl font-extrabold tracking-tight">Practice Details</h1>
                <p className="text-muted-foreground">Tell us where and how you practice medicine.</p>
              </div>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Practice Type</Label>
                    <RadioGroup defaultValue="clinic" className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {["Hospital", "Private Clinic", "Group Practice", "Telemedicine", "Multiple"].map(type => (
                        <div key={type} className="relative">
                          <RadioGroupItem value={type.toLowerCase()} id={type} className="peer sr-only" />
                          <Label 
                            htmlFor={type}
                            className="flex flex-col items-center justify-center rounded-xl border-2 border-border/50 bg-card p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary transition-all cursor-pointer text-xs font-bold"
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-border/50">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Primary Location</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <Input placeholder="Hospital / Clinic Name" className="rounded-xl h-11" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="City" className="rounded-xl h-11" />
                        <Input placeholder="State / Province" className="rounded-xl h-11" />
                      </div>
                      <Input placeholder="Website (Optional)" className="rounded-xl h-11" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep} className="font-bold h-12 px-8">
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={nextStep} className="bg-primary font-bold h-12 px-12 rounded-xl shadow-lg">
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
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
                <h1 className="text-3xl font-extrabold tracking-tight">Schedule & Fees</h1>
                <p className="text-muted-foreground">Set your availability and consultation rates.</p>
              </div>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-8 space-y-10">
                  <div className="space-y-4">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Weekly Availability
                    </Label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                        <div key={day} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-muted/20">
                          <span className="text-xs font-bold">{day}</span>
                          <Checkbox defaultChecked />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/50">
                    <div className="space-y-4">
                      <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Consultation Fee</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="100.00" className="pl-10 rounded-xl h-11" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Session Duration</Label>
                      <Select defaultValue="30">
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 Minutes</SelectItem>
                          <SelectItem value="30">30 Minutes</SelectItem>
                          <SelectItem value="45">45 Minutes</SelectItem>
                          <SelectItem value="60">60 Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep} className="font-bold h-12 px-8">
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={nextStep} className="bg-primary font-bold h-12 px-12 rounded-xl shadow-lg">
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div 
              key="step-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight">Professional Bio</h1>
                <p className="text-muted-foreground">Let patients know who you are and what you care about.</p>
              </div>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="h-24 w-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center relative group cursor-pointer overflow-hidden">
                      <Camera className="h-8 w-8 text-muted-foreground group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <Label className="font-bold">Profile Photo</Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Professional Introduction</Label>
                    <Textarea 
                      placeholder="Write a brief introduction for patients..." 
                      className="min-h-[150px] rounded-2xl resize-none"
                    />
                    <div className="text-right text-[10px] text-muted-foreground font-bold">0 / 500 characters</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" /> Languages Spoken
                      </Label>
                      <Input placeholder="English, Arabic..." className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" /> Awards/Memberships
                      </Label>
                      <Input placeholder="e.g. Fellow of Cardiology" className="rounded-xl h-11" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep} className="font-bold h-12 px-8">
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={nextStep} className="bg-primary font-bold h-12 px-12 rounded-xl shadow-xl shadow-primary/20">
                  Submit Verification <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div 
              key="step-7"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12 space-y-8"
            >
              <div className="h-1 bg-muted w-full max-w-xs mx-auto rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full bg-primary animate-progress-flow w-1/2 rounded-full" />
              </div>

              <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto border-4 border-primary/20">
                <Clock className="h-12 w-12 text-primary animate-pulse" />
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight">Verification Pending</h1>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto font-medium">
                  Thank you for applying, Dr. {user?.lastName || "Professional"}. Our team is reviewing your documents.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                {[
                  { label: "Document Review", status: "In Progress", color: "text-amber-500" },
                  { label: "License Verification", status: "Pending", color: "text-muted-foreground" },
                  { label: "Account Activation", status: "Pending", color: "text-muted-foreground" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                    <span className="font-bold">{item.label}</span>
                    <Badge variant="outline" className={cn("rounded-full px-3", item.color)}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-sm font-medium text-muted-foreground leading-relaxed italic max-w-sm mx-auto">
                We typically process applications within 24-48 business hours. Youll receive an email notification once your account is activated.
              </div>

              <Button 
                onClick={() => router.push("/doctor")}
                variant="outline"
                className="w-full max-w-xs h-14 text-lg font-bold rounded-2xl border-primary text-primary hover:bg-primary/10 transition-all"
              >
                Access Limited Dashboard
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style jsx global>{`
        @keyframes progress-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-progress-flow {
          animation: progress-flow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
