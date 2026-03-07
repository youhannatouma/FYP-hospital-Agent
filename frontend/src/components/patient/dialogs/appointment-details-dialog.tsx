"use client"

import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarDays, Clock, MapPin, Video, Phone, Download, Sparkles, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppointmentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any | null
}

export function AppointmentDetailsDialog({ 
  open, 
  onOpenChange, 
  appointment 
}: AppointmentDetailsDialogProps) {
  const { toast } = useToast()

  if (!appointment) return null

  const handleExport = () => {
    toast({
      title: "Exporting Summary",
      description: "Your clinical summary is being prepared for download.",
    })
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Clinical summary downloaded successfully.",
      })
    }, 1500)
  }

  const TypeIcon = appointment.typeIcon || Video

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-card/95 backdrop-blur-2xl shadow-2xl rounded-[2.5rem]">
        <div className="relative overflow-hidden">
          {/* Decorative Header Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          
          <DialogHeader className="relative z-10 p-8 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner-glow">
                <FileText className="h-5 w-5" />
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary">
                Record ID: {appointment.id?.slice(0, 8) || "N/A"}
              </div>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-none">
              Appointment Summary
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Region */}
          <div className="relative z-10 px-8 py-4 dialog-content-scrollable">
            <div className="grid gap-8 py-2">
              
              {/* Doctor Profile Section */}
              <div className="flex items-center gap-5 p-6 rounded-3xl bg-primary/5 border border-primary/20 shadow-inner-glow">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-white dark:bg-slate-900 shadow-premium font-black text-2xl text-primary border border-primary/10">
                  {appointment.avatar}
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Consultant</span>
                   </div>
                   <h3 className="text-2xl font-black text-foreground leading-tight">{appointment.doctor}</h3>
                   <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">
                      {appointment.specialty}
                   </div>
                </div>
              </div>

              {/* Data Grid Section */}
              <div className="space-y-4">
                 <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Event Parameters
                 </label>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: CalendarDays, label: "Scheduled Date", value: appointment.date },
                      { icon: Clock, label: "Temporal Slot", value: appointment.time },
                      { icon: TypeIcon, label: "Interaction Modality", value: appointment.type },
                      { icon: MapPin, label: "Geographic/Digital Node", value: appointment.location },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-border/50 bg-background/50 flex flex-col gap-2">
                         <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                            <item.icon className="h-4 w-4" />
                         </div>
                         <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">{item.label}</span>
                            <span className="text-sm font-bold text-foreground block truncate">{item.value}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Clinical Notes Section */}
              {appointment.notes && (
                <div className="space-y-3 mt-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Dispatch / Clinical Notes
                  </label>
                  <div className="p-5 rounded-3xl border border-border/50 bg-background/50 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <FileText className="h-12 w-12" />
                     </div>
                     <p className="text-sm font-medium leading-relaxed text-muted-foreground italic">
                        "{appointment.notes}"
                     </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 p-8 pt-4 flex flex-col sm:flex-row gap-4 border-t border-border/30 bg-card/50">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="h-14 flex-1 rounded-2xl border-border/50 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-all"
            >
              Close Record
            </Button>
            <Button 
               onClick={handleExport}
               className="h-14 flex-[1.5] rounded-2xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest shadow-glow transition-all active:scale-95 flex items-center gap-3 justify-center"
            >
               <Download className="h-4 w-4" /> Export clinical summary
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
