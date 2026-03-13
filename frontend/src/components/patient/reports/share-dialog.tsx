"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareReportDialogProps {
  reportName: string
  trigger?: React.ReactNode
}

export function ShareReportDialog({ reportName, trigger }: ShareReportDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [doctor, setDoctor] = useState<string>("")

  const handleShare = () => {
    toast({
      title: "Document Shared",
      description: `${reportName} has been shared with ${doctor}.`,
    })
    setOpen(false)
    setDoctor("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            className="flex-1 border-border text-foreground gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            Share with Doctor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Grant access to {reportName} to a healthcare provider.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Doctor</label>
            <Select value={doctor} onValueChange={setDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Choose doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dr. Michael Chen">Dr. Michael Chen (Cardiology)</SelectItem>
                <SelectItem value="Dr. Emily Watson">Dr. Emily Watson (Dermatology)</SelectItem>
                <SelectItem value="Dr. Sarah Kim">Dr. Sarah Kim (Pediatrics)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={!doctor}>
            Share Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
