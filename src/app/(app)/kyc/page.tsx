"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { api, ApiError, type KYCDTO } from "@/lib/api";
import { useSession } from "@/lib/session-context";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

const statusMeta: Record<KYCDTO["status"], { label: string; className: string; icon: typeof ShieldCheck }> = {
  unverified: { label: "Not submitted", className: "bg-cream-200 text-maroon-950/60", icon: ShieldQuestion },
  pending: { label: "Under review", className: "bg-gold-100 text-gold-700", icon: ShieldAlert },
  verified: { label: "Verified", className: "bg-emerald-100 text-emerald-700", icon: ShieldCheck },
  rejected: { label: "Rejected — resubmit", className: "bg-red-100 text-red-700", icon: ShieldAlert },
};

export default function ProfilePage() {
  const { user } = useSession();
  const [kyc, setKyc] = useState<KYCDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    api
      .myKYC()
      .then(setKyc)
      .catch(() => setKyc(null))
      .finally(() => setLoading(false));
  }, []);

  const status = kyc?.status ?? user?.kycStatus ?? "unverified";
  const meta = statusMeta[status];
  const Icon = meta.icon;
  const canSubmit = status === "unverified" || status === "rejected";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("Attach a photo of your ID.");
      return;
    }
    setError("");
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const form = new FormData();
    form.append("fullName", String(data.get("fullName")));
    form.append("idType", String(data.get("idType")));
    form.append("idNumber", String(data.get("idNumber")));
    form.append("document", file);
    try {
      const result = await api.submitKYC(form);
      setKyc(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-maroon-950/50">Loading profile…</p>;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-extrabold text-maroon-950">Profile</h1>

      <div className={cardClass}>
        <p className="font-bold text-maroon-950">{user?.fullName}</p>
        <p className="text-sm text-maroon-950/60">{user?.email}</p>
        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}>
          <Icon size={14} />
          Verification: {meta.label}
        </div>
        {kyc?.reviewNote && status === "rejected" && (
          <p className="mt-2 text-sm text-red-600">{kyc.reviewNote}</p>
        )}
      </div>

      {canSubmit && (
        <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-4`}>
          <p className="font-bold text-maroon-950">Verify your identity</p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className={labelClass}>
              Full legal name
            </label>
            <input id="fullName" name="fullName" required defaultValue={user?.fullName} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="idType" className={labelClass}>
              ID type
            </label>
            <select id="idType" name="idType" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select ID type
              </option>
              <option value="national_id">National ID (NIN)</option>
              <option value="passport">International Passport</option>
              <option value="drivers_license">Driver&apos;s License</option>
              <option value="voters_card">Voter&apos;s Card</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="idNumber" className={labelClass}>
              ID number
            </label>
            <input id="idNumber" name="idNumber" required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>ID document (photo or scan)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block text-sm text-maroon-950/70 file:mr-3 file:rounded-full file:border-0 file:bg-maroon-700 file:px-4 file:py-2 file:text-sm file:font-bold file:text-cream-50"
            />
          </div>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? "Submitting…" : "Submit for verification"}
          </button>
        </form>
      )}
    </div>
  );
}
