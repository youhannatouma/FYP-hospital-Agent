"use client"

import { useState } from "react"
import { Phone, Mail, MessageSquare, Sparkles, ShieldCheck, Building2, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { m, AnimatePresence } from "framer-motion"

interface ContactAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactAdminDialog({ open, onOpenChange }: ContactAdminDialogProps) {
  const { toast } = useToast()
  const [method, setMethod] = useState("message")
  const [department, setDepartment] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleContact = () => {
    if (!department) {
      toast({
        title: "Protocol Violation",
        description: "Please specify the target administrative department.",
        variant: "destructive",
      })
      return
    }

    if (method === "message" && !message.trim()) {
      toast({
        title: "Null Content",
        description: "Transmission requires valid message data.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    // Mock API
    setTimeout(() => {
      setIsSending(false)
      onOpenChange(false)
      toast({
        title: "Uplink Established",
        description: `Your communication has been dispatched to ${department} via ${method}.`,
      })
      setDepartment("")
      setMessage("")
      setMethod("message")
    }, 1000)
  }

  const contactMethods = [
    { id: 'message', label: 'Message', icon: MessageSquare, description: 'Direct secure link' },
    { id: 'urgent', label: 'Urgent', icon: Phone, description: 'Immediate callback' },
    { id: 'email', label: 'Formal', icon: Mail, description: 'Institutional email' },
    { id: 'it', label: 'IT Support', icon: Terminal, description: 'Tech infrastructure' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-card/95 backdrop-blur-2xl shadow-2xl rounded-[2.5rem]">
        <div className="relative overflow-hidden">
          {/* Decorative Header Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          
          <DialogHeader className="relative z-10 p-8 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner-glow">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary">
                Administrative Liaison
              </div>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-none">
              Contact Admin
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-base mt-2">
              Secure uplink for operational support and hospital management coordination.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content Region */}
          <div className="relative z-10 px-8 py-4 dialog-content-scrollable">
            <div className="grid gap-8 py-2">
              {/* Department Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Terminal className="h-3 w-3" /> Target Department
                </label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="h-14 rounded-2xl border-border/50 bg-background/50 font-bold text-sm shadow-subtle focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Identify department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50 shadow-2xl">
                    <SelectItem value="Medical Records" className="rounded-lg font-bold py-3">Medical Records</SelectItem>
                    <SelectItem value="IT Governance" className="rounded-lg font-bold py-3">IT Governance</SelectItem>
                    <SelectItem value="Facility Ops" className="rounded-lg font-bold py-3">Facility Ops</SelectItem>
                    <SelectItem value="HR Support" className="rounded-lg font-bold py-3">HR Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Method Tiles */}
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Priority Level
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {contactMethods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex flex-col items-start p-5 rounded-3xl border transition-all duration-300 group relative overflow-hidden",
                        method === m.id 
                          ? "border-primary bg-primary/5 shadow-inner-glow" 
                          : "border-border/50 bg-background/50 hover:bg-muted/50 hover:border-border"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-all",
                        method === m.id ? "bg-primary text-white shadow-lg" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-black text-foreground">{m.label}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        {m.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Content */}
              <AnimatePresence mode="wait">
                {method === "message" && (
                  <m.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" /> Secure Briefing
                    </label>
                    <Textarea 
                      placeholder="Specify your operational inquiry or support request..." 
                      className="min-h-[140px] rounded-3xl border-border/50 bg-background/50 p-6 font-medium text-sm shadow-subtle focus-visible:ring-primary/20 resize-none transition-all"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative z-10 p-8 pt-4 flex flex-col sm:flex-row gap-4 border-t border-border/30 bg-card/50">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="h-12 flex-1 rounded-2xl border-border/50 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-all text-xs"
            >
              Abort Link
            </Button>
            <Button 
              onClick={handleContact} 
              disabled={isSending} 
              className={cn(
                "h-12 flex-1 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest shadow-glow transition-all active:scale-95 text-xs",
                isSending && "opacity-50"
              )}
            >
              {isSending ? "Syncing..." : "Initialize Uplink"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
