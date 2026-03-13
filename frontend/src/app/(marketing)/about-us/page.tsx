import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShieldCheck, HeartPulse, Brain, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl mb-6 italic">
            Revolutionizing <span className="text-primary italic">Healthcare</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Care.AI is the world's most advanced AI-powered healthcare platform, bringing medical excellence to every doorstep through neural clinical intelligence.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-24">
          {[
            { icon: ShieldCheck, title: "Mission", text: "To democratize high-end medical expertise using safe, secure, and authenticated AI systems." },
            { icon: Brain, title: "Engine", text: "Powered by proprietary neural networks trained on millions of clinical data points." },
            { icon: Zap, title: "Speed", text: "Reducing patient wait times from weeks to seconds through instant AI triage and analysis." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[3rem] bg-foreground p-12 lg:p-24 text-center text-white overflow-hidden relative">
           <div className="absolute inset-0 bg-primary/10 blur-[100px]" />
           <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black mb-8">Join the Healthcare Future</h2>
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 px-12 h-16 text-xl font-bold">
                  Start Your Journey <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
           </div>
        </div>
      </div>
    </div>
  )
}
