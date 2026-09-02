"use client";

import { useEffect, useRef, useState } from "react";
import { getAccessToken, wsBase } from "@/lib/api";

export type AdminNotification = {
  type: "new_message";
  orderId: string;
  senderName: string;
  preview: string;
  asset: string;
  amount: number;
};

// Plays a short two-tone chime via the Web Audio API — no audio file to
// host, and it's synthesized fresh each call so overlapping notifications
// don't need their own <audio> element pool. Browsers block audio before
// any user gesture on the page, so this silently no-ops until the admin has
// clicked anywhere at least once — same reason resumeAudioContext exists.
let audioCtx: AudioContext | null = null;

function resumeAudioContext() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => undefined);
}

function playChime() {
  if (!audioCtx || audioCtx.state !== "running") return;
  const now = audioCtx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
    osc.connect(gain).connect(audioCtx!.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

// One persistent, order-agnostic WebSocket for the whole admin session —
// mount this once (in the admin shell, not per-tab) so a new trader message
// pages admin regardless of which order or tab they currently have open.
export function useAdminNotifications(ready: boolean) {
  const [latest, setLatest] = useState<AdminNotification | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const unlock = () => resumeAudioContext();
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const token = getAccessToken();
    if (!token) return;

    const socket = new WebSocket(`${wsBase()}/api/v1/admin/notifications/ws?token=${encodeURIComponent(token)}`);
    socketRef.current = socket;
    socket.onmessage = (event) => {
      try {
        const note = JSON.parse(event.data) as AdminNotification;
        if (note.type === "new_message") {
          setLatest(note);
          playChime();
        }
      } catch {
        // ignore malformed frames
      }
    };
    return () => socket.close();
  }, [ready]);

  return { latest, dismiss: () => setLatest(null) };
}
