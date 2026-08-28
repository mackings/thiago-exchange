"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { api, type MessageDTO } from "@/lib/api";
import { inputClass } from "@/lib/ui";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TradeChat({
  messages,
  currentUserId,
  connected,
  onSend,
}: {
  messages: MessageDTO[];
  currentUserId: string;
  connected: boolean;
  onSend: (body: string, attachmentUrl?: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [pendingImage, setPendingImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body && !pendingImage) return;

    if (pendingImage) {
      setUploading(true);
      try {
        const { url } = await api.upload(pendingImage.file);
        onSend(body, url);
      } catch {
        // silently drop — the user still has their draft text to retry
        return;
      } finally {
        setUploading(false);
        URL.revokeObjectURL(pendingImage.previewUrl);
        setPendingImage(null);
      }
    } else {
      onSend(body);
    }
    setDraft("");
  }

  return (
    <div className="flex flex-col rounded-2xl border border-cream-300 bg-white">
      <div className="flex items-center justify-between border-b border-cream-200 px-4 py-2.5">
        <p className="text-sm font-bold text-maroon-950">Trade chat</p>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            connected ? "text-emerald-600" : "text-gold-600"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-gold-500"}`} />
          {connected ? "Live" : "Connecting…"}
        </span>
      </div>

      <div className="flex h-80 flex-col gap-3 overflow-y-auto bg-cream-50/50 px-4 py-3">
        {messages.length === 0 && (
          <p className="m-auto text-sm text-maroon-950/40">No messages yet — say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              {!mine && (
                <span className="mb-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-maroon-700 text-[10px] font-bold text-white">
                  TE
                </span>
              )}
              <div className={`flex max-w-[75%] flex-col ${mine ? "items-end" : "items-start"}`}>
                {!mine && <span className="mb-0.5 px-1 text-[11px] font-bold text-maroon-950/50">Thiago Exchange</span>}
                <div
                  className={`overflow-hidden rounded-2xl ${
                    mine ? "bg-maroon-700 text-cream-50" : "bg-white text-maroon-950 shadow-sm"
                  } ${m.body ? "px-3.5 py-2" : "p-1"}`}
                >
                  {m.attachmentUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.attachmentUrl} alt="Attachment" className="max-h-56 rounded-xl object-cover" />
                  )}
                  {m.body && <p className="text-sm">{m.body}</p>}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-maroon-950/35">{formatTime(m.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {pendingImage && (
        <div className="flex items-center gap-2 border-t border-cream-200 px-3 pt-2">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingImage.previewUrl} alt="Selected attachment" className="h-14 w-14 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(pendingImage.previewUrl);
                setPendingImage(null);
              }}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-maroon-950 text-white"
            >
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-cream-200 p-3">
        <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-cream-200 text-maroon-700">
          <ImagePlus size={16} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
              e.target.value = "";
            }}
          />
        </label>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className={`${inputClass} flex-1`}
        />
        <button
          type="submit"
          disabled={(!draft.trim() && !pendingImage) || uploading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon-700 text-cream-50 transition-colors hover:bg-maroon-800 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
