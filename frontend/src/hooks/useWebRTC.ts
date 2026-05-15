import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebRTC = (roomId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // 1. Initialize Socket.io
    // Note: path matches backend mount at /ws
    socket.current = io('http://localhost:8000', { path: '/ws/' });

    // 2. Setup WebRTC
    const setupMedia = async () => {
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        const errStr = "WebRTC requires a secure context (HTTPS or localhost).";
        console.error(errStr);
        setMediaError(errStr);
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setMediaError(null);

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
      } catch (err: any) {
        console.error("Failed to setup media:", err);
        setMediaError(err.message || "Failed to access camera/microphone.");
        
        // Still setup peer connection so they can receive video even if they have no camera
        pc.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
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
      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
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
      const offer = await pc.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
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

  return { localStream, remoteStream, mediaError };
};
