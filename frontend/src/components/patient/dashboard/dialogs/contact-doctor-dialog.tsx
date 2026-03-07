"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageSquare, Phone, AlertCircle, PhoneCall } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ContactDoctorDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const handleAction = (action: string) => {
    toast({
      title: "Action Initiated",
      description: action,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Phone className="h-4 w-4" />
          Contact Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Healthcare Provider</DialogTitle>
          <DialogDescription>
            Choose how you would like to connect with your doctor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-3 h-14"
            onClick={() => handleAction("Secure messaging interface opened.")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Send Message</span>
              <span className="text-xs text-muted-foreground">For non-urgent questions</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-3 h-14"
            onClick={() => handleAction("Redirecting to call scheduling...")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 text-green-600">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Schedule a Call</span>
              <span className="text-xs text-muted-foreground">Book a 15-min consultation</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-3 h-14 border-destructive/30 hover:bg-destructive/5"
            onClick={() => handleAction("Emergency services contacted (Simulation).")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-destructive">Emergency Line</span>
              <span className="text-xs text-muted-foreground">For immediate medical attention</span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
