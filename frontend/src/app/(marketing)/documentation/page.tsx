/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
import { Book, FileCode, Search, Terminal, Zap, Puzzle } from "lucide-react"

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Sidebar Nav (Static) */}
          <aside className="w-full lg:w-64 space-y-8 shrink-0">
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <input className="w-full h-12 bg-muted/50 border border-border rounded-xl pl-12 pr-4 text-sm" placeholder="Search docs..." />
             </div>

             <div className="space-y-6">
               {[
                 { title: "Getting Started", links: ["Introduction", "Quick Start", "Clinical Setup", "API Keys"] },
                 { title: "AI Integration", links: ["Neural Triage", "Data Models", "LLM Protocol", "Security Layers"] },
                 { title: "Institutional", links: ["HIPAA Sync", "HL7/FHIR Connect", "Electronic Health", "Auditing"] }
               ].map((group, i) => (
                 <div key={i}>
                   <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">{group.title}</h4>
                   <ul className="space-y-2 border-l border-border pl-4">
                     {group.links.map((link, j) => (
                       <li key={j} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">{link}</li>
                     ))}
                   </ul>
                 </div>
               ))}
             </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            <h1 className="text-5xl font-black tracking-tight mb-6 italic">Engineering <span className="text-primary italic">Guidelines</span></h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Learn how to integrate the Care.AI nervous system into your clinical workflows and institutional frameworks.
            </p>

            <div className="grid gap-6 md:grid-cols-2 mb-16">
               <div className="p-8 rounded-[2rem] bg-slate-900 text-white group cursor-pointer hover:bg-primary transition-all duration-300">
                  <Terminal className="h-8 w-8 mb-6 text-primary group-hover:text-white" />
                  <h3 className="text-xl font-bold mb-2 italic">Developer Hub</h3>
                  <p className="text-slate-400 text-sm group-hover:text-white/80">API reference and neural integration guide for engineers.</p>
               </div>
               <div className="p-8 rounded-[2rem] bg-card border border-border hover:border-primary/50 cursor-pointer transition-all">
                  <Puzzle className="h-8 w-8 mb-6 text-primary" />
                  <h3 className="text-xl font-bold mb-2 italic">Clinical SDK</h3>
                  <p className="text-muted-foreground text-sm">Download official libraries for JavaScript, Python, and Ruby.</p>
               </div>
            </div>

            <article className="prose prose-slate dark:prose-invert max-w-none">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Introduction to Neural Triage</h2>
              <p>
                The Care.AI API allows institutional partners to securely trigger medical triage pathways. Our models utilize advanced LLM architectures specifically tuned for clinical diagnostic precision.
              </p>
              
              <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 my-8">
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-white/30 font-black ml-2 uppercase">Endpoint: /v2/clinical/triage</span>
                </div>
                <code className="text-sm text-emerald-400 block break-all font-medium">
                  POST https://api.care.ai/v2/clinical/triage <br />
                  -H "Authorization: Bearer YOUR_AUTHENTICATION_KEY" <br />
                  -d &#123; "symptoms": ["chest_pain", "short_breath"], "priority": "urgent" &#125;
                </code>
              </div>

              <div className="p-8 rounded-3xl bg-primary/10 border-l-4 border-primary">
                 <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> Clinical Note
                 </h4>
                 <p className="text-sm m-0">
                    Always include the <code className="text-primary font-bold">is_high_priority</code> flag for symptom sets that involve respiratory or cardiovascular distress. This bypasses standard queues.
                 </p>
              </div>
            </article>
          </div>

        </div>
      </div>
    </div>
  )
}
