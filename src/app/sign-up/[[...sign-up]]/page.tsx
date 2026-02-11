import { SignUp } from "@clerk/nextjs";
import { Activity, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Side: Branding / Benefits */}
      <div className="hidden md:flex flex-1 bg-primary/5 p-12 flex-col justify-between relative overflow-hidden border-r border-border/50">
        <div className="absolute bottom-0 left-0 w-full h-full -z-10 opacity-20">
          <div className="absolute bottom-[10%] left-[10%] w-[60%] h-[60%] bg-primary/40 blur-[120px] rounded-full" />
        </div>

        <Link href="/" className="flex items-center gap-2 text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Care</span>
        </Link>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              Begin Your <span className="text-primary italic">Smart</span>{" "}
              Health Journey.
            </h2>
            <p className="text-muted-foreground text-lg max-w-md font-medium">
              Create your account in seconds and unlock the full potential of
              AI-driven healthcare.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              "Personalized AI health insights",
              "Direct connection to specialists",
              "Secure medical data vault",
              "Real-time appointment tracking",
            ].map((text, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-foreground font-semibold"
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
          <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span>GDPR Compliant & Encrypted Data</span>
        </div>
      </div>

      {/* Right Side: SignUp Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-12 space-y-8">
          <div className="md:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">
                Care
              </span>
            </Link>
          </div>

          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-sm font-bold h-11 rounded-xl shadow-lg shadow-primary/20",
                card: "bg-transparent border-0 shadow-none p-10",
                headerTitle:
                  "text-3xl font-extrabold tracking-tight text-foreground",
                headerSubtitle: "text-muted-foreground font-medium",
                socialButtonsBlockButton:
                  "rounded-xl border-border bg-card/50 hover:bg-muted text-foreground transition-all h-11",
                formFieldLabel: "text-sm font-bold text-foreground",
                formFieldInput:
                  "rounded-xl border-border bg-muted/30 focus:border-primary focus:ring-primary h-11",
                footerActionLink:
                  "text-primary hover:text-primary/80 font-bold",
              },
            }}
            fallbackRedirectUrl="/onboarding"
          />
        </div>
      </div>
    </div>
  );
}
