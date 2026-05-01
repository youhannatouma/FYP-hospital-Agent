/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
import { FileText, Shield, Gavel, Scale } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white mb-6">
            <Gavel className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-4 italic">Terms of <span className="text-primary italic">Service</span></h1>
          <p className="text-muted-foreground uppercase tracking-[0.2em] font-black text-xs">Healthcare Platform Legal Framework</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
          <section className="p-8 rounded-[2rem] bg-muted/20 border border-border">
             <h2 className="text-xl font-black flex items-center gap-3 mt-0 uppercase tracking-tight">1. Clinical Usage Boundary</h2>
             <p className="text-sm font-medium leading-relaxed italic">
               Care.AI provides a clinical intelligence platform designed to augment, not replace, professional medical judgement. Users must always verify AI-generated insights with their licensed healthcare providers.
             </p>
          </section>

          <article className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
               <Shield className="h-6 w-6 text-primary" /> Account Responsibility
            </h3>
            <p className="text-muted-foreground">
               You are responsible for maintaining the security of your Care.AI credentials. We utilize multi-factor authentication (MFA) and biometric verification for all clinical portals to ensure data integrity.
            </p>
          </article>

          <article className="space-y-6 border-l-4 border-primary pl-8">
            <h3 className="text-2xl font-bold">Intellectual Property</h3>
            <p className="text-muted-foreground">
               The "Care.AI" brand, its proprietary clinical neural networks, and all interface designs are the exclusive property of Care Enterprise. Unauthorized reverse-engineering of our medical models is strictly prohibited.
            </p>
          </article>

          <div className="flex items-center gap-4 p-6 rounded-2xl bg-primary/5 border border-primary/20">
             <Scale className="h-6 w-6 text-primary" />
             <p className="text-xs font-bold uppercase tracking-wide">Users agree to be bound by the governing laws of the jurisdiction of clinical operation.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
