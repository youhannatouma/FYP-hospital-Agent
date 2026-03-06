import { ShieldAlert, Terminal, Lock, Key, Cpu, Radio } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-20">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 text-emerald-500 mb-8 shadow-2xl">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl mb-6 italic">Secure <span className="text-primary italic">Architecture</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Building the most resilient clinical data infrastructure ever conceived. Zero-trust security is baked into our neural core.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-24">
          {[
            { icon: Lock, title: "Post-Quantum", desc: "Encryption standards designed to withstand future quantum computing attacks." },
            { icon: Terminal, title: "Zero-Trust", desc: "Every API request is authenticated, authorized, and continuously validated." },
            { icon: Cpu, title: "Neural Isolation", desc: "Patient data segments are cryptographically isolated within machine learning tiers." },
            { icon: Key, title: "HSM Storage", desc: "Private keys are managed within dedicated Hardware Security Modules." },
            { icon: Radio, title: "Real-time Auditing", desc: "24/7 autonomous monitoring for behavioral anomalies and intrusion attempts." },
            { icon: ShieldAlert, title: "SOC2 Type II", desc: "Regular third-party auditing of our security and privacy control matrix." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col items-center text-center group hover:bg-slate-950 transition-all duration-500">
               <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all mb-6">
                  <item.icon className="h-8 w-8" />
               </div>
               <h3 className="text-xl font-bold mb-4 group-hover:text-white">{item.title}</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-12 lg:p-20 rounded-[4rem] bg-slate-950 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10">
              <Terminal className="h-64 w-64" />
           </div>
           <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
             <div>
               <h2 className="text-4xl font-black mb-6 italic underline decoration-primary underline-offset-8">Bug Bounty Program</h2>
               <p className="text-lg text-slate-400 font-medium mb-8 leading-relaxed">
                 We collaborate with the world's most talented security researchers to ensure our systems remain impenetrable.
               </p>
               <button className="h-14 px-8 rounded-full bg-primary font-black uppercase tracking-widest text-sm italic">Report Vulnerability</button>
             </div>
             <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-slate-500 font-black text-xs uppercase">Metric</span>
                    <span className="text-slate-500 font-black text-xs uppercase">Status</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Uptime</span>
                    <span className="text-emerald-500 font-black italic">99.998%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Encrypted Nodes</span>
                    <span className="text-emerald-500 font-black italic">100% Verified</span>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
