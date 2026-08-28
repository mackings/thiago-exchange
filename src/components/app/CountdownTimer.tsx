"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function CountdownTimer({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState(() => new Date(deadline).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(new Date(deadline).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (remaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1.5 text-xs font-bold text-maroon-950/50">
        <Clock size={14} />
        Payment window closed
      </span>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const urgent = totalSeconds < 300;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
        urgent ? "bg-red-100 text-red-700" : "bg-gold-100 text-gold-700"
      }`}
    >
      <Clock size={14} />
      {minutes}:{seconds.toString().padStart(2, "0")} left
    </span>
  );
}
