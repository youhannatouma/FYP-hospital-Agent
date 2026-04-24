'use client';

import React, { useRef, useEffect } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';

interface VideoCallProps {
  roomId: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId }) => {
  const { localStream, remoteStream } = useWebRTC(roomId);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gray-900 rounded-xl shadow-2xl">
      <h2 className="text-white text-xl font-bold">Video Appointment: {roomId}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video border-2 border-primary/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
          <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">You (Local)</span>
        </div>
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video border-2 border-secondary/20">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">Remote Participant</span>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <button className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
