"use client"

import React, { useState, useEffect } from "react"
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  Settings, 
  Maximize2,
  Volume2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface VideoCallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  remoteName: string
  role?: "doctor" | "patient"
}

export function VideoCallDialog({ open, onOpenChange, remoteName, role = "doctor" }: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (open) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(interval)
  }, [open])

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-zinc-950 sm:max-w-[100vw] sm:max-h-[100vh] h-screen w-screen overflow-hidden">
        {/* Main Video Area */}
        <div className="relative h-full w-full flex flex-col">
          
          {/* Main Remote Video */}
          <div className="flex-1 relative flex items-center justify-center bg-zinc-900 overflow-hidden">
            {isVideoOff ? (
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32 ring-4 ring-zinc-800">
                  <AvatarFallback className="text-4xl bg-zinc-800 text-zinc-400">
                    {remoteName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xl font-medium text-white">{remoteName} is waiting...</div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-zinc-900 to-emerald-900/20" />
            )}
            
            {/* Overlay Info */}
            <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
              <Badge className="bg-red-500 hover:bg-red-600 text-white animate-pulse">REC</Badge>
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-sm font-medium text-white">{formatDuration(callDuration)}</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
               <Button variant="ghost" size="icon" className="bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Local Self Video */}
          <div className="absolute top-6 right-24 w-48 aspect-video rounded-xl bg-zinc-800 border-2 border-white/20 overflow-hidden shadow-2xl z-20 group">
             <div className="h-full w-full bg-gradient-to-tr from-indigo-900 to-indigo-700 flex items-center justify-center">
                <Avatar className="h-12 w-12 ring-2 ring-white/20">
                    <AvatarFallback className="bg-white/10 text-white">
                      {role === "doctor" ? "DS" : "PJ"}
                    </AvatarFallback>
                </Avatar>
             </div>
             <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white">
               {role === "doctor" ? "You (Dr. Smith)" : "You (Patient)"}
             </div>
          </div>

          {/* Controls Bar */}
          <div className="h-24 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-center gap-4 px-6 z-30">
            <div className="absolute left-6 hidden md:flex flex-col">
              <span className="text-white font-medium">{remoteName}</span>
              <span className="text-zinc-500 text-xs text-primary font-medium">Video Consultation — Cardiology</span>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "h-12 w-12 rounded-full border-none transition-all",
                  isMuted ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/10 text-white hover:bg-white/20"
                )}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "h-12 w-12 rounded-full border-none transition-all",
                  isVideoOff ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/10 text-white hover:bg-white/20"
                )}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
              </Button>

              <Button 
                variant="destructive" 
                size="icon" 
                className="h-14 w-14 rounded-full shadow-lg shadow-red-900/40 hover:scale-105 active:scale-95 transition-all"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-none bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-none bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <Users className="h-5 w-5" />
              </Button>
            </div>

            <div className="absolute right-6 flex items-center gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-zinc-400">
                  <Volume2 className="h-4 w-4" />
                  <div className="w-24 h-1 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-primary" />
                  </div>
               </div>
               <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <Settings className="h-5 w-5" />
               </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
