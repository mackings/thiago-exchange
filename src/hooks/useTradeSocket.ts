"use client";

import { useEffect, useRef, useState } from "react";
import { getAccessToken, wsBase, type MessageDTO } from "@/lib/api";

export function useTradeSocket(orderId: string, initialMessages: MessageDTO[], ready: boolean = true) {
  const [messages, setMessages] = useState<MessageDTO[]>(initialMessages);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // `initialMessages` starts empty and is only populated once the page's
    // own history fetch resolves — but this hook mounts unconditionally on
    // the caller's very first render (React hook rules), so it captures that
    // still-empty array. Depending on `initialMessages` here (not just
    // `orderId`) means once the real history actually arrives, it's applied
    // instead of being silently dropped — which is why a page refresh used
    // to show an empty chat even though the messages were safely persisted.
    setMessages(initialMessages);
  }, [orderId, initialMessages]);

  useEffect(() => {
    if (!orderId || !ready) return;
    // The access token loads asynchronously (session refresh on mount, or
    // login) — this effect depends on `ready` too, so once the caller signals
    // the token is actually available, connection is retried rather than
    // failing silently forever from a stale first-render check.
    const token = getAccessToken();
    if (!token) return;

    const socket = new WebSocket(`${wsBase()}/api/v1/orders/${orderId}/ws?token=${encodeURIComponent(token)}`);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as MessageDTO;
        setMessages((prev) => [...prev, msg]);
      } catch {
        // ignore malformed frames
      }
    };

    return () => socket.close();
  }, [orderId, ready]);

  function send(body: string, attachmentUrl?: string) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ body, attachmentUrl }));
    }
  }

  return { messages, connected, send };
}
