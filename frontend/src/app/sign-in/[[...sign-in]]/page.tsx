import { auth } from "@clerk/nextjs/server"
import { SignIn } from "@clerk/nextjs"
import { Activity } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

function resolveSignedInRedirect(role?: string) {
  if (role === "doctor") return "/doctor"
  if (role === "admin") return "/admin"
  if (role === "patient") return "/patient"
  return "/onboarding"
}

export default async function SignInPage() {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role

  if (userId) {
    redirect(resolveSignedInRedirect(role))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Side: Branding / Info */}
      <div className="hidden md:flex flex-1 bg-primary/5 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full -z-10 opacity-20">
          <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-primary/30 blur-[100px] rounded-full" />
        </div>

        <Link href="/" className="flex items-center gap-2 text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Care</span>
        </Link>

        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Welcome Back to <span className="text-primary italic">Precision</span> Care.
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Your intelligence-backed health journey continues here. Access your records, consult with AI, or book your next specialist.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
          <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span>Enterprise-grade security &amp; HIPAA compliant</span>
        </div>
      </div>

      {/* Right Side: SignIn Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-8 py-12">
          <div className="md:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">Care</span>
            </Link>
          </div>
          
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            forceRedirectUrl="/onboarding"
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-sm font-bold h-11 rounded-xl shadow-lg shadow-primary/20",
                card: "bg-transparent border-0 shadow-none p-0",
                headerTitle: "text-3xl font-extrabold tracking-tight text-foreground",
                headerSubtitle: "text-muted-foreground font-medium",
                socialButtonsBlockButton: "rounded-xl border-border bg-card/50 hover:bg-muted text-foreground transition-all h-11",
                formFieldLabel: "text-sm font-bold text-foreground",
                formFieldInput: "rounded-xl border-border bg-muted/30 focus:border-primary focus:ring-primary backdrop-blur-sm h-11",
                footerActionLink: "text-primary hover:text-primary/80 font-bold",
                identityPreviewText: "text-foreground font-medium",
                identityPreviewEditButton: "text-primary font-bold",
              }
            }}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">Medical Professionals</span>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col items-center text-center gap-3">
            <h3 className="font-bold text-sm">Are you a Doctor?</h3>
            <p className="text-xs text-muted-foreground">Access your clinical dashboard and patient engagements.</p>
            <Link href="/doctor-sign-in" className="w-full">
              <button className="w-full h-11 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm rounded-xl transition-all">
                Sign In to Clinical Workspace
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
