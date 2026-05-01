"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Video, Mic, MicOff, VideoOff, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function JoinMeetingDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [connecting, setConnecting] = useState(false)

  const handleJoin = () => {
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      setOpen(false)
      toast({
        title: "Joined Meeting",
        description: "You have successfully joined the virtual consultation room.",
      })
    }, 1500)
  }

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setMicOn(true)
      setCameraOn(true)
      setConnecting(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Video className="mr-2 h-3 w-3" />
          Join Virtual Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 bg-muted/30 border-b">
          <DialogTitle>Waiting Room</DialogTitle>
        </DialogHeader>

        <div className="aspect-video bg-black/90 relative flex items-center justify-center">
          {cameraOn ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Camera Preview Simulation</span>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-2 text-muted-foreground">
               <VideoOff className="h-10 w-10 opacity-50" />
               <span className="text-sm">Camera is off</span>
             </div>
          )}
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <Button
              variant={micOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => setMicOn(!micOn)}
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button
              variant={cameraOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={() => setCameraOn(!cameraOn)}
            >
              {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="absolute top-4 right-4">
             <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
               <Settings className="h-5 w-5" />
             </Button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
             <span className="font-semibold">Dr. Michael Chen</span>
             <span className="text-green-600 flex items-center gap-1.5">
               <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
               Doctor is online
             </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoin} disabled={connecting} className="gap-2">
              {connecting ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>Join Now</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
