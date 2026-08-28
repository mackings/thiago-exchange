"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { useSession } from "@/lib/session-context";
import { ApiError } from "@/lib/api";
import { inputClass, primaryButtonClass } from "@/lib/ui";

export default function LoginPage() {
  const { login } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    try {
      await login(String(data.get("email")), String(data.get("password")));
      router.push("/market");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Log in" switchHref="/signup" switchLabel="Sign up" footer="Trade crypto with Thiago Exchange">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className={inputClass}
        />
        <label className="sr-only" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          className={inputClass}
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className={`${primaryButtonClass} mt-3`}>
          {submitting ? "Logging in…" : "Next"}
        </button>
      </form>
    </AuthShell>
  );
}
