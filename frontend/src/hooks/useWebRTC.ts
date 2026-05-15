import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebRTC = (roomId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // 1. Initialize Socket.io
    socket.current = io('http://localhost:8000', { path: '/ws/socket.io' });

    // 2. Setup WebRTC
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        pc.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));

        pc.current.ontrack = (event) => {
          if (event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        };

        pc.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.current?.emit('signal', { room: roomId, candidate: event.candidate });
          }
        };
      } catch (err) {
        console.error("Failed to setup media:", err);
      }
    };

    setupMedia().then(() => {
      if (!socket.current) return;
      if (socket.current.connected) {
        socket.current.emit('join_room', { room: roomId });
      } else {
        socket.current.on('connect', () => {
          socket.current?.emit('join_room', { room: roomId });
        });
      }
      
      socket.current.on('user_joined', async () => {
        console.log('User joined room, creating offer...');
        await createOffer();
      });

      socket.current.on('signal', async (data) => {
        try {
          if (data.offer) {
            await handleOffer(data.offer);
          } else if (data.answer) {
            await handleAnswer(data.answer);
          } else if (data.candidate) {
            await handleCandidate(data.candidate);
          }
        } catch (err) {
          console.error("Signaling error:", err);
        }
      });
    });

    return () => {
      // ── SAFE CLEANUP ──────────────────────────────
      // Use local variables or check refs directly to avoid closure stale state
      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      // Stop all tracks in the stream if it exists
      setLocalStream(prev => {
        if (prev) {
          prev.getTracks().forEach(track => track.stop());
        }
        return null;
      });
      setRemoteStream(null);
      // ──────────────────────────────────────────────
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const createOffer = async () => {
      if (!pc.current) return;
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      socket.current?.emit('signal', { room: roomId, offer });
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.current?.emit('signal', { room: roomId, answer });
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = async (candidate: RTCIceCandidateInit) => {
      if (!pc.current) return;
      await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  return { localStream, remoteStream };
};
