"use client"
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
         MessageSquare, Users, Settings, Maximize2, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useWebRTC } from "@/hooks/useWebRTC"  // ← ADD THIS

interface VideoCallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  remoteName: string
  role?: "doctor" | "patient"
  roomId: string   // ← ADD THIS — needed for WebRTC
}

export function VideoCallDialog({ 
  open, onOpenChange, remoteName, role = "doctor", roomId  // ← ADD roomId
}: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  // ── ADD: WebRTC hook ──────────────────────────────
  const { localStream, remoteStream } = useWebRTC(open ? roomId : "")
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Mute/unmute the actual track
  const handleMuteToggle = () => {
    localStream?.getAudioTracks().forEach(track => {
      track.enabled = isMuted  // flip: if currently muted, enable it
    })
    setIsMuted(!isMuted)
  }

  // Turn camera on/off
  const handleVideoToggle = () => {
    localStream?.getVideoTracks().forEach(track => {
      track.enabled = isVideoOff
    })
    setIsVideoOff(!isVideoOff)
  }
  // ─────────────────────────────────────────────────

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (open) {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-zinc-950 sm:max-w-[100vw] sm:max-h-[100vh] h-screen w-screen overflow-hidden">
        <div className="relative h-full w-full flex flex-col">

          {/* ── REMOTE VIDEO (main screen) ── */}
          <div className="flex-1 relative flex items-center justify-center bg-zinc-900 overflow-hidden">
            {remoteStream ? (
              // Real remote video
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              // Waiting state — no remote stream yet
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32 ring-4 ring-zinc-800">
                  <AvatarFallback className="text-4xl bg-zinc-800 text-zinc-400">
                    {remoteName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xl font-medium text-white">
                  Waiting for {remoteName} to join...
                </div>
              </div>
            )}

            {/* Top bar overlaid on video */}
            <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
              <Badge className="bg-red-500 text-white animate-pulse">REC</Badge>
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-white">{formatDuration(callDuration)}</span>
              </div>
            </div>
          </div>

          {/* ── LOCAL VIDEO (picture-in-picture) ── */}
          <div className="absolute top-6 right-24 w-48 aspect-video rounded-xl bg-zinc-800 border-2 border-white/20 overflow-hidden shadow-2xl z-20">
            {localStream && !isVideoOff ? (
              // Real local camera
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted          // always mute local to avoid echo
                className="w-full h-full object-cover scale-x-[-1]"  // mirror effect
              />
            ) : (
              // Camera off state
              <div className="h-full w-full bg-zinc-800 flex items-center justify-center">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-white/10 text-white">
                    {role === "doctor" ? "DS" : "PJ"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white">
              {role === "doctor" ? "You (Dr. Smith)" : "You (Patient)"}
            </div>
          </div>

          {/* ── CONTROLS ── */}
          <div className="h-24 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-center gap-4 px-6 z-30">
            <div className="absolute left-6 hidden md:flex flex-col">
              <span className="text-white font-medium">{remoteName}</span>
              <span className="text-zinc-500 text-xs text-primary font-medium">Video Consultation</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mute — now actually mutes the audio track */}
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full border-none transition-all",
                  isMuted ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/10 text-white hover:bg-white/20"
                )}
                onClick={handleMuteToggle}   // ← was just setIsMuted
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {/* Camera — now actually stops video track */}
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full border-none transition-all",
                  isVideoOff ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/10 text-white hover:bg-white/20"
                )}
                onClick={handleVideoToggle}  // ← was just setIsVideoOff
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
              </Button>

              {/* End call */}
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>

              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-none bg-white/10 text-white hover:bg-white/20">
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-none bg-white/10 text-white hover:bg-white/20">
                <Users className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}