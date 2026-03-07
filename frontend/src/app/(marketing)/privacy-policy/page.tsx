import { Shield, Lock, FileCheck, Eye } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-4 italic">Privacy <span className="text-primary italic">Policy</span></h1>
          <p className="text-muted-foreground uppercase tracking-[0.2em] font-black text-xs">Last Updated: March 2026</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" /> Data Sovereignty
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At Care.AI, we believe your health data belongs exclusively to you. All clinical records are encrypted using post-quantum cryptographic standards before being processed by our neural networks.
            </p>
          </section>

          <section className="bg-muted/30 p-8 rounded-3xl border border-border">
            <h3 className="text-xl font-bold mb-4">Core Principles</h3>
            <ul className="grid gap-4 md:grid-cols-2 list-none p-0">
              {[
                { icon: Eye, title: "No Third-Party Access", text: "We never sell or lease your clinical data to insurance or pharma companies." },
                { icon: Shield, title: "Zero-Knowledge Triage", text: "Our AI analyzes symptoms without storing personally identifiable information." },
                { icon: FileCheck, title: "Total Portability", text: "Download or delete your entire medical history with a single command." },
                { icon: Lock, title: "Encrypted Storage", text: "AES-256 bit encryption at rest and TLS 1.3 in transit." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                   <item.icon className="h-5 w-5 text-primary shrink-0 mt-1" />
                   <div>
                     <p className="font-bold text-sm">{item.title}</p>
                     <p className="text-xs text-muted-foreground">{item.text}</p>
                   </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
             <h2 className="text-2xl font-bold">Clinical Integration</h2>
             <p className="text-muted-foreground">
               When you share data with a doctor through our platform, a secure, time-limited cryptographic tunnel is established. Only the specified physician can decrypt the record for the duration of the consultation.
             </p>
          </section>
        </div>
      </div>
    </div>
  )
}
