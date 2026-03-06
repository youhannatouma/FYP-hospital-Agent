import { ShieldCheck, Heart, FileCheck, Landmark } from "lucide-react"

export default function HIPAACompliancePage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-6">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-4 italic">HIPAA <span className="text-emerald-500 italic">Compliance</span></h1>
          <p className="text-muted-foreground uppercase tracking-[0.2em] font-black text-xs">Institutional Standard Certification</p>
        </div>

        <div className="grid gap-8 mb-16">
          {[
            { 
              icon: FileCheck, 
              title: "Administrative Safeguards", 
              text: "Rigorous internal policies for risk assessment and management, ensuring all staff undergo continuous security awareness training." 
            },
            { 
              icon: ShieldCheck, 
              title: "Physical Safeguards", 
              text: "Our data centers utilize biometric access control and 24/7 surveillance, meeting Tier IV infrastructure requirements." 
            },
            { 
              icon: Landmark, 
              title: "Technical Safeguards", 
              text: "Access control, audit controls, integrity controls, and transmission security automated at the neural core level." 
            }
          ].map((item, i) => (
            <div key={i} className="flex gap-6 p-8 rounded-[2rem] bg-card border border-border items-start">
               <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-emerald-500 shrink-0">
                  <item.icon className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.text}</p>
               </div>
            </div>
          ))}
        </div>

        <div className="p-12 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 text-center">
           <Heart className="h-12 w-12 text-emerald-500 mx-auto mb-6 animate-pulse" />
           <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">Institutional Trust</h2>
           <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
             Care.AI is fully BAA-ready. We sign Business Associate Agreements with all institutional partners, ensuring shared legal responsibility for protected health information (PHI).
           </p>
        </div>
      </div>
    </div>
  )
}
