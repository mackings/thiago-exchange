"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { useSession } from "@/lib/session-context";
import { ApiError } from "@/lib/api";
import { inputClass, primaryButtonClass } from "@/lib/ui";

export default function SignupPage() {
  const { register } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password"));
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: String(data.get("email")),
        password,
        fullName: String(data.get("fullName")),
        phone: String(data.get("phone") ?? ""),
      });
      router.push("/kyc");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Sign up" switchHref="/login" switchLabel="Log in" footer="Trade crypto with Thiago Exchange">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input id="fullName" name="fullName" type="text" required autoComplete="name" placeholder="Full name" className={inputClass} />
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="Email" className={inputClass} />
        <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Phone (optional)" className={inputClass} />
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Password (min. 8 characters)"
          className={inputClass}
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className={`${primaryButtonClass} mt-3`}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
