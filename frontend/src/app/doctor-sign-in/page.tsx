"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Activity, Stethoscope, Mail, Lock, Fingerprint, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { db } from "@/lib/hospital-core/MockDatabase"
import apiClient from "@/lib/api-client"

export default function DoctorSignInPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: "",
    customId: "",
    password: ""
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiClient.post('/auth/login', formData);
      const { user, access_token } = response.data;
      if (user.role !== 'doctor') {
        throw new Error('Not a doctor account');
      }
      toast({ title: "Welcome, " + (user.first_name || user.email), description: "Successfully signed in to your portal." })
      // In a real app, save token to cookies/localStorage
      router.push("/doctor")
    } catch (error) {
      console.warn('[DoctorSignIn] API failed, falling back to mock DB (or non-doctor user)');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      const users = db.getUsers()
      const doctor = users.find(u => 
        u.role === 'Doctor' && 
        u.email === formData.email && 
        u.customId === formData.customId && 
        u.password === formData.password
      )

      if (doctor) {
        toast({ title: "Welcome, " + doctor.name, description: "Successfully signed in to your portal." })
        router.push("/doctor")
      } else {
        toast({ 
          title: "Sign in failed", 
          description: "Invalid email, doctor ID, or password. Please contact your admin if you've forgotten your credentials.",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Left Decoration */}
      <div className="hidden md:flex flex-1 bg-primary/5 p-12 flex-col justify-between relative overflow-hidden border-r border-border/50">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
          <div className="absolute top-[10%] right-[10%] w-[60%] h-[60%] bg-primary/40 blur-[120px] rounded-full" />
        </div>

        <Link href="/" className="flex items-center gap-2 text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Care</span>
        </Link>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              Physician <span className="text-primary italic">Portal</span>.
            </h2>
            <p className="text-muted-foreground text-lg max-w-md font-medium">
              Access your personalized dashboard, manage schedules, and coordinate patient care with AI advanced tools.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
          <span>Enterprise-grade security for medical professionals</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="md:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tighter">Care</span>
            </Link>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Doctor Sign In</h1>
            <p className="text-muted-foreground font-medium">Enter your credentials provided by the administrator.</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@hospital.com" 
                    className="pl-10 h-12 rounded-xl border-border bg-muted/30 focus:border-primary transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorId" className="text-sm font-bold">Doctor ID</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="doctorId" 
                    placeholder="DOC-XXXXX" 
                    className="pl-10 h-12 rounded-xl border-border bg-muted/30 focus:border-primary transition-all"
                    value={formData.customId}
                    onChange={(e) => setFormData({...formData, customId: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-bold">Password</Label>
                  <Link href="#" className="text-xs text-primary font-bold hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 rounded-xl border-border bg-muted/30 focus:border-primary transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In to Physician Portal
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Not a doctor?{" "}
              <Link href="/sign-in" className="text-primary font-bold hover:underline">
                Patient Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
