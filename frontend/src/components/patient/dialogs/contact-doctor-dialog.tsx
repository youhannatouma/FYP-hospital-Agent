"use client"

/**
 * ContactDoctorDialog
 * Follows: Single Responsibility Principle (SRP) — UI only, delegates to repositories
 * Follows: Dependency Inversion Principle (DIP) — uses IDoctorRepository + IMessageRepository via container
 */

import { useState, useEffect, useCallback } from "react"
import { Phone, Mail, Video, MessageSquare, Sparkles, User, ShieldCheck } from "lucide-react"
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
import { VideoCallDialog } from "@/components/shared/video-call-dialog"
import { cn } from "@/lib/utils"
import { m, AnimatePresence } from "framer-motion"
import { getServiceContainer } from "@/lib/services/service-container"
import type { Doctor } from "@/lib/services/repositories/doctor-repository"

// ─── Contact Method Config (SRP: data config separate from logic) ─────────────

const CONTACT_METHODS = [
  { id: "message", label: "Message",  icon: MessageSquare, description: "Secure text sync" },
  { id: "call",    label: "Callback", icon: Phone,         description: "Vocal consult"   },
  { id: "video",   label: "Video",    icon: Video,         description: "Digital presence" },
  { id: "email",   label: "Email",    icon: Mail,          description: "Formal dispatch"  },
] as const

type ContactMethodId = (typeof CONTACT_METHODS)[number]["id"]

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactDoctorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ContactDoctorDialog({ open, onOpenChange }: ContactDoctorDialogProps) {
  const { toast } = useToast()
  const [method, setMethod] = useState<ContactMethodId>("message")
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([])

  // Load doctors via DoctorRepository (DIP)
  const loadDoctors = useCallback(async () => {
    try {
      const container = getServiceContainer()
      const data = await container.doctor.getAvailableDoctors()
      setDoctorsList(data)
    } catch (err) {
      console.error("[ContactDoctorDialog] Failed to fetch doctors:", err)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadDoctors()
    }
  }, [open, loadDoctors])

  const resetForm = () => {
    setSelectedDoctorId("")
    setMessage("")
    setMethod("message")
  }

  const handleContact = async () => {
    if (!selectedDoctorId) {
      toast({
        title: "Required Field",
        description: "Please select a doctor to contact.",
        variant: "destructive",
      })
      return
    }

    if ((method === "message" || method === "email") && !message.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter a message.",
        variant: "destructive",
      })
      return
    }

    // Video — open call immediately without sending a message
    if (method === "video") {
      setIsVideoCallOpen(true)
      return
    }

    setIsSending(true)
    try {
      const container = getServiceContainer()

      if (method === "message" || method === "email") {
        await container.message.sendMessage({
          receiver_id: selectedDoctorId,
          subject: method === "email" ? "Formal dispatch" : "Secure message",
          body: message,
        })
      }

      const selectedDoc = doctorsList.find((d) => d.user_id === selectedDoctorId || d.id === selectedDoctorId)
      const docName = selectedDoc
        ? `Dr. ${(selectedDoc as any).last_name || (selectedDoc as any).first_name || "Provider"}`
        : "the provider"

      toast({
        title: method === "message" ? "Message Sent" : "Request Submitted",
        description:
          method === "message" || method === "email"
            ? `Your message has been sent securely to ${docName}.`
            : `A request for a ${method} call has been sent to ${docName}'s office.`,
      })

      onOpenChange(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const selectedDoc = doctorsList.find(
    (d) => d.user_id === selectedDoctorId || d.id === selectedDoctorId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-card/95 backdrop-blur-2xl shadow-2xl rounded-[2.5rem]">
        <div className="relative overflow-hidden">
          {/* Decorative Header Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

          <DialogHeader className="relative z-10 p-8 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary">
                Secure Communication
              </div>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-none">
              Contact Specialist
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-base mt-2">
              Encrypted channel for direct coordination with your assigned clinical team.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content Region */}
          <div className="relative z-10 px-8 py-4 dialog-content-scrollable">
            <div className="grid gap-8 py-2">
              {/* Doctor Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" /> Select Recipient
                </label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger className="h-14 rounded-2xl border-border/50 bg-background/50 font-bold text-sm shadow-subtle focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Identify provider" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                    {doctorsList.map((doc) => (
                      <SelectItem
                        key={doc.user_id || doc.id}
                        value={doc.user_id || doc.id}
                        className="rounded-xl font-bold py-3"
                      >
                        <div className="flex flex-col">
                          <span>Dr. {(doc as any).first_name} {(doc as any).last_name}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {doc.specialty || "Specialist"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Method Tiles */}
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Preferred Modality
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {CONTACT_METHODS.map((cm) => (
                    <button
                      key={cm.id}
                      onClick={() => setMethod(cm.id)}
                      className={cn(
                        "flex flex-col items-start p-5 rounded-3xl border transition-all duration-300 group relative overflow-hidden",
                        method === cm.id
                          ? "border-primary bg-primary/5 shadow-inner-glow"
                          : "border-border/50 bg-background/50 hover:bg-muted/50 hover:border-border"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-all",
                          method === cm.id
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                        )}
                      >
                        <cm.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-black text-foreground">{cm.label}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        {cm.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Content */}
              <AnimatePresence mode="wait">
                {(method === "message" || method === "email") && (
                  <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" /> Secure Message
                    </label>
                    <Textarea
                      placeholder="Type your secure clinical inquiry here..."
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
              className="h-12 flex-1 rounded-2xl border-border/50 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-all"
            >
              Cancel Request
            </Button>
            <Button
              onClick={handleContact}
              disabled={isSending}
              className={cn(
                "h-12 flex-1 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest shadow-glow transition-all active:scale-95",
                isSending && "opacity-50"
              )}
            >
              {isSending ? "Syncing..." : "Initialize Contact"}
            </Button>
          </div>
        </div>
      </DialogContent>

      <VideoCallDialog
        open={isVideoCallOpen}
        onOpenChange={(val) => {
          setIsVideoCallOpen(val)
          if (!val) onOpenChange(false)
        }}
        remoteName={
          (selectedDoc as any)?.last_name ||
          (selectedDoc as any)?.first_name ||
          selectedDoctorId
        }
        role="patient"
        roomId={`contact_${selectedDoctorId.replace(/\s+/g, "_")}`}
      />
    </Dialog>
  )
}
