"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  User, 
  Stethoscope, 
  CheckCircle2, 
  ArrowRight,
  Zap} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { m } from "framer-motion"

export default function RoleSelectionPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = React.useState<'patient' | 'doctor' | null>(null)

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem("onboarding_role", selectedRole)
      router.push(`/sign-up?role=${selectedRole}`)
    }
  }

  const roles = [
    {
      id: 'patient',
      title: "I'm a Patient",
      subtitle: "Find doctors, manage health, book appointments",
      icon: User,
      color: "teal",
      accent: "border-teal-500/50",
      glow: "shadow-[0_0_20px_rgba(20,184,166,0.15)]",
      benefits: [
        "AI-powered doctor matching",
        "24/7 health assistant",
        "Digital medical records",
        "Online prescriptions",
        "Medicine delivery"
      ]
    },
    {
      id: 'doctor',
      title: "I'm a Healthcare Provider",
      subtitle: "Join our network of verified doctors",
      icon: Stethoscope,
      color: "purple",
      accent: "border-purple-500/50",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
      benefits: [
        "Manage appointments digitally",
        "AI diagnostic assistance",
        "Video consultations",
        "Grow your practice",
        "Flexible scheduling"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Zap className="h-3 w-3" />
              Join Care
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Choose Your Role
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mt-4">
              Join thousands of people using Care to transform the medical experience.
            </p>
          </m.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role, idx) => (
            <m.div
              key={role.id}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                className={cn(
                  "relative cursor-pointer transition-all duration-300 border-2 bg-card/50 backdrop-blur-sm group overflow-hidden h-full",
                  selectedRole === role.id 
                    ? cn("border-primary scale-[1.02]", role.glow)
                    : "border-border hover:border-muted-foreground/30 hover:shadow-lg"
                )}
                onClick={() => setSelectedRole(role.id as 'patient' | 'doctor') }
              >
                {selectedRole === role.id && (
                  <div className="absolute top-4 right-4 text-primary">
                    <CheckCircle2 className="h-6 w-6 fill-primary text-primary-foreground" />
                  </div>
                )}
                
                <CardContent className="p-8 space-y-6">
                  <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                    role.id === 'patient' ? "bg-teal-500/10 text-teal-500" : "bg-purple-500/10 text-purple-500"
                  )}>
                    <role.icon className="h-8 w-8 text-current" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{role.title}</h2>
                    <p className="text-sm text-muted-foreground">{role.subtitle}</p>
                  </div>

                  <ul className="space-y-4 pt-2">
                    {role.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-3 text-sm text-foreground/80 font-medium">
                        <CheckCircle2 className={cn(
                          "h-4 w-4 shrink-0",
                          role.id === 'patient' ? "text-teal-500" : "text-purple-500"
                        )} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </m.div>
          ))}
        </div>

        <m.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            className="w-full max-w-sm h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 group relative overflow-hidden"
            disabled={!selectedRole}
            onClick={handleContinue}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Continue
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>

          <p className="text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </m.div>
      </div>
    </div>
  )
}
