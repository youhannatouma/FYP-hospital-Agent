import { Button } from "@/components/ui/button"
import { MessageSquare, Mail, Phone, MapPin, Send } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl mb-8 italic">
              Get in <span className="text-primary italic">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium mb-12">
              Have questions about our clinical AI or institutional integration? Our team is available 24/7 for support.
            </p>

            <div className="space-y-8">
              {[
                { icon: Mail, label: "Email Support", value: "support@care.ai" },
                { icon: Phone, label: "Clinical Hotline", value: "+1 (888) CARE-AI-01" },
                { icon: MapPin, label: "Headquarters", value: "Neural Plaza, Medical Valley, CA" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-[3rem] p-8 lg:p-12 shadow-2xl">
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <input className="w-full h-14 bg-background border border-border rounded-2xl px-6 focus:border-primary outline-none" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                  <input className="w-full h-14 bg-background border border-border rounded-2xl px-6 focus:border-primary outline-none" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Department</label>
                <select className="w-full h-14 bg-background border border-border rounded-2xl px-6 focus:border-primary outline-none">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Institutional Sales</option>
                  <option>Privacy Office</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                <textarea className="w-full min-h-[150px] bg-background border border-border rounded-3xl p-6 focus:border-primary outline-none resize-none" placeholder="How can we help?" />
              </div>
              <Button size="lg" className="w-full h-16 rounded-full bg-slate-900 dark:bg-slate-800 text-white hover:bg-primary font-black uppercase tracking-widest">
                Send Transmission <Send className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
