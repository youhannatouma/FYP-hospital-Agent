"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, MoreVertical, Share2, Trash2, Printer, LucideIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DocumentPreviewDialogProps {
  doc: {
    title: string
    date: string
    size: string
    icon: LucideIcon
    iconBg: string
    iconColor: string
  }
}

export function DocumentActionsMenu({ doc }: DocumentPreviewDialogProps) {
  const { toast } = useToast()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toast({ title: "Downloading", description: `${doc.title} is being downloaded.` })}>
          <Download className="mr-2 h-3.5 w-3.5" /> Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Printing", description: `Sending ${doc.title} to printer.` })}>
          <Printer className="mr-2 h-3.5 w-3.5" /> Print
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Link Copied", description: "Shareable link copied to clipboard." })}>
          <Share2 className="mr-2 h-3.5 w-3.5" /> Share
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast({ title: "Deleted", description: `${doc.title} has been removed.` })}>
          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function DocumentDownloadButton({ title }: { title: string }) {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      toast({
        title: "Download Complete",
        description: `${title} has been saved to your device.`,
      })
    }, 1000)
  }

  return (
    <Button
      size="sm"
      className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? (
        <>
          <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Download className="h-3 w-3" />
          Download
        </>
      )}
    </Button>
  )
}
