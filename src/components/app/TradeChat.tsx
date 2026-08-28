"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import type { MessageDTO } from "@/lib/api";
import { inputClass } from "@/lib/ui";

export default function TradeChat({
  messages,
  currentUserId,
  connected,
  onSend,
}: {
  messages: MessageDTO[];
  currentUserId: string;
  connected: boolean;
  onSend: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    onSend(body);
    setDraft("");
  }

  return (
    <div className="flex flex-col rounded-2xl border border-cream-300 bg-white">
      <div className="flex items-center justify-between border-b border-cream-200 px-4 py-2.5">
        <p className="text-sm font-bold text-maroon-950">Trade chat</p>
        <span className={`text-xs font-semibold ${connected ? "text-emerald-600" : "text-maroon-950/40"}`}>
          {connected ? "Live" : "Connecting…"}
        </span>
      </div>

      <div className="flex h-72 flex-col gap-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="m-auto text-sm text-maroon-950/40">No messages yet — say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? "bg-maroon-700 text-cream-50" : "bg-cream-200 text-maroon-950"
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-cream-200 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className={`${inputClass} flex-1`}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon-700 text-cream-50 transition-colors hover:bg-maroon-800 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
