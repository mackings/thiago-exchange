"use client";

import { useEffect, useRef, useState } from "react";
import { getAccessToken, wsBase, type MessageDTO } from "@/lib/api";

export function useTradeSocket(orderId: string, initialMessages: MessageDTO[]) {
  const [messages, setMessages] = useState<MessageDTO[]>(initialMessages);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
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
  }, [orderId]);

  function send(body: string) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ body }));
    }
  }

  return { messages, connected, send };
}
