"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { coins } from "@/lib/coins";
import { site, whatsappLink } from "@/lib/site";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const coin = String(data.get("coin") ?? "");
    const message = String(data.get("message") ?? "").trim();

    if (!name || !contact || !message) {
      setError("Please fill in your name, a way to reach you, and your message.");
      return;
    }
    setError("");

    const whatsappMessage = [
      `Hello ${site.name}, I'd like to get in touch.`,
      ``,
      `Name: ${name}`,
      `Contact: ${contact}`,
      coin ? `Coin of interest: ${coin}` : null,
      ``,
      `Message: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappLink(whatsappMessage), "_blank", "noopener,noreferrer");
    setSubmitted(true);
    form.reset();
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="text-emerald-600" size={32} />
        </span>
        <h3 className="font-display text-xl font-bold text-maroon-950">
          Message ready to send
        </h3>
        <p className="max-w-sm text-sm text-maroon-950/60">
          We opened WhatsApp with your details filled in — just hit send
          there and our team will respond shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm font-bold text-maroon-700 underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-bold text-maroon-950">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Jane Doe"
            className="rounded-lg border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-maroon-950 outline-none transition-colors hover:border-cream-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-600/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact"
            className="text-sm font-bold text-maroon-950"
          >
            Email or phone number
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            required
            placeholder="you@email.com or WhatsApp number"
            className="rounded-lg border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-maroon-950 outline-none transition-colors hover:border-cream-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-600/20"
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="coin" className="text-sm font-bold text-maroon-950">
            Coin of interest (optional)
          </label>
          <select
            id="coin"
            name="coin"
            defaultValue=""
            className="rounded-lg border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-maroon-950 outline-none transition-colors hover:border-cream-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-600/20"
          >
            <option value="">Select a coin</option>
            {coins.map((coin) => (
              <option key={coin.id} value={`${coin.name} (${coin.symbol})`}>
                {coin.name} ({coin.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="message"
            className="text-sm font-bold text-maroon-950"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="Tell us how much you'd like to buy or sell, and any questions you have."
            className="resize-none rounded-lg border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-maroon-950 outline-none transition-colors hover:border-cream-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-600/20"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>
      )}

      <button
        type="submit"
        className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-maroon-700 px-6 py-3 font-bold text-cream-50 transition-colors hover:bg-maroon-800 sm:w-auto"
      >
        <Send
          size={18}
          className="transition-transform group-hover:translate-x-0.5"
        />
        Send via WhatsApp
      </button>
      <p className="mt-3 text-xs text-maroon-950/40">
        Sending opens WhatsApp with your message pre-filled so you can reach
        our team directly.
      </p>
    </form>
  );
}
