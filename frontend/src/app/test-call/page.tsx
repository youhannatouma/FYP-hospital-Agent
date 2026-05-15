"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { VideoCallDialog } from "@/components/shared/video-call-dialog"

export default function TestCallPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<"doctor" | "patient">("patient")
  const roomId = "test-room-123"

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Video Call Test Page</h1>
      <div className="flex gap-4">
        <Button onClick={() => { setRole("patient"); setIsOpen(true); }}>
          Join as Patient
        </Button>
        <Button onClick={() => { setRole("doctor"); setIsOpen(true); }}>
          Join as Doctor
        </Button>
      </div>
      
      <VideoCallDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        remoteName={role === "patient" ? "Dr. Smith" : "Patient John"}
        role={role}
        roomId={roomId}
      />
    </div>
  )
}
