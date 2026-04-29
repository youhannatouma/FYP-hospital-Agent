"use client"

import { useState, useEffect } from "react"
import { Phone, Mail, MessageSquare, ShieldCheck, Building2, Terminal, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { m, AnimatePresence } from "framer-motion"
import { useHospital } from "@/hooks/use-hospital"
import { useAuth } from "@clerk/nextjs"

interface ContactAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactAdminDialog({ open, onOpenChange }: ContactAdminDialogProps) {
  const { toast } = useToast()
  const { admin, messages: messageManager } = useHospital()
  const { getToken } = useAuth()
  
  const [targetAdminId, setTargetAdminId] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  
  const [admins, setAdmins] = useState<any[]>([])
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true)

  useEffect(() => {
    if (open) {
      const fetchAdmins = async () => {
        try {
          setIsLoadingAdmins(true)
          const token = await getToken()
          const users = await admin.getAllUsers(token || undefined)
          // Filter only admins
          const adminList = users.filter((u: any) => u.role === 'admin')
          setAdmins(adminList)
        } catch (error) {
          console.error('Failed to fetch admins:', error)
        } finally {
          setIsLoadingAdmins(false)
        }
      }
      fetchAdmins()
    }
  }, [open, admin, getToken])

  const handleContact = async () => {
    if (!targetAdminId) {
      toast({
        title: "Selection Required",
        description: "Please identify an available administrator for this inquiry.",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please provide details for your support request.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const token = await getToken()
      await messageManager.sendMessage(targetAdminId, message, token || undefined)
      
      const selectedAdmin = admins.find(a => a.id === targetAdminId)
      const adminName = selectedAdmin ? `${selectedAdmin.first_name} ${selectedAdmin.last_name}` : "Administrator"

      toast({
        title: "Request Dispatched",
        description: `Your communication has been sent to ${adminName}.`,
      })
      onOpenChange(false)
      setTargetAdminId("")
      setMessage("")
    } catch (error) {
      console.error('Failed to send message', error)
      toast({
        title: "Dispatch Failed",
        description: "Unable to transmit communication to the management team.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-card/95 backdrop-blur-2xl shadow-2xl rounded-[2.5rem]">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          
          <DialogHeader className="relative z-10 p-8 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner-glow">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary">
                System Support
              </div>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-none">
              Contact Admin
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-base mt-2">
              Liaison with hospital management for operational or technical assistance.
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 px-8 py-4">
            <div className="grid gap-8 py-2">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Terminal className="h-3 w-3" /> Available Administrator
                </label>
                <Select value={targetAdminId} onValueChange={setTargetAdminId}>
                  <SelectTrigger className="h-14 rounded-2xl border-border/50 bg-background/50 font-bold text-sm shadow-subtle focus:ring-primary/20 transition-all">
                    {isLoadingAdmins ? (
                      <div className="flex items-center gap-2 italic text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Polling secure registry...
                      </div>
                    ) : (
                      <SelectValue placeholder="Identify administrator" />
                    )}
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50 shadow-2xl">
                    {admins.length > 0 ? (
                      admins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id} className="rounded-lg font-bold py-3">
                          {admin.first_name} {admin.last_name} ({admin.role})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs font-bold text-muted-foreground">
                        No administrators currently logged in the registry.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Secure Inquiry
                </label>
                <Textarea 
                  placeholder="Detail your request for the administrative team..." 
                  className="min-h-[160px] rounded-3xl border-border/50 bg-background/50 p-6 font-medium text-sm shadow-subtle focus-visible:ring-primary/20 resize-none transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
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
              disabled={isSending || isLoadingAdmins} 
              className={cn(
                "h-12 flex-1 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest shadow-glow transition-all active:scale-95 text-xs",
                (isSending || isLoadingAdmins) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Dispatching...
                </div>
              ) : "Dispatch Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
