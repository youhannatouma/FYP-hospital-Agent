import { Briefcase, MapPin, Globe, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl mb-6 italic">
            Build the <span className="text-primary italic">Neural Future</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Join a multi-disciplinary team of clinical researchers, AI engineers, and design visionaries redefining the human-health interface.
          </p>
        </div>

        <div className="grid gap-8 mb-24">
          {[
            { title: "Senior AI Physician (Machine Learning)", type: "Remote / San Francisco", dept: "Neural Core" },
            { title: "Principal Product Designer", type: "London / Hybrid", dept: "Experience Unit" },
            { title: "Clinical Data Scientist", type: "Remote", dept: "Research Lab" },
            { title: "Infrastructure Security Engineer", type: "New York", dept: "Trust & Safety" }
          ].map((job, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <h3 className="text-2xl font-bold">{job.title}</h3>
                   <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{job.dept}</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground font-medium text-sm">
                   <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.type}</div>
                   <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> Full-time</div>
                </div>
              </div>
              <Button size="lg" className="rounded-2xl group-hover:bg-primary transition-all">Apply Now</Button>
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
           {[
             { icon: Globe, title: "Remote-First", text: "Work from anywhere in the world where you're most inspired." },
             { icon: Sparkles, title: "Equity & Ownership", text: "Every team member is an owner in Care.AI's mission." },
             { icon: Globe, title: "Global Impact", text: "Your code will directly impact millions of patient lives." }
           ].map((item, i) => (
             <div key={i} className="text-center p-8">
               <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                 <item.icon className="h-8 w-8 text-primary" />
               </div>
               <h4 className="text-xl font-bold mb-3">{item.title}</h4>
               <p className="text-muted-foreground">{item.text}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
