"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import { api, ApiError, fileUrl, type KYCDTO } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

function isImagePath(url: string) {
  return /\.(png|jpe?g|gif|webp|heic)$/i.test(url);
}

export function KycTab({ onError, onSuccess }: { onError: (message: string) => void; onSuccess: (message: string) => void }) {
  const [items, setItems] = useState<KYCDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<KYCDTO | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api.adminListPendingKYC().then(setItems).catch((err) => onError(err instanceof ApiError ? err.message : "Couldn't load KYC queue.")).finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  function openReview(k: KYCDTO) {
    setReviewing(k);
    setRejectReason("");
    setRejecting(false);
  }

  async function approve() {
    if (!reviewing) return;
    setSubmitting(true);
    try {
      await api.adminReviewKYC(reviewing.id, true, "");
      onSuccess("Approved.");
      setReviewing(null);
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't submit that review.");
    } finally {
      setSubmitting(false);
    }
  }

  async function reject() {
    if (!reviewing) return;
    setSubmitting(true);
    try {
      await api.adminReviewKYC(reviewing.id, false, rejectReason.trim() || "Document unclear — please resubmit");
      onSuccess("Rejected.");
      setReviewing(null);
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't submit that review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-800/40">
        No pending submissions.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">{items.length} pending submission{items.length === 1 ? "" : "s"}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((k) => {
          const docUrl = fileUrl(k.documentUrl);
          return (
            <Card key={k.id} className="flex flex-col overflow-hidden">
              {isImagePath(k.documentUrl) ? (
                <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={docUrl} alt="KYC document" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center bg-slate-100 dark:bg-slate-800">
                  <p className="text-xs font-semibold text-muted-foreground">No preview</p>
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon-700 text-xs font-bold text-white">
                    {k.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{k.fullName}</p>
                    <Badge tone="neutral" className="mt-0.5 capitalize">{k.idType.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
                <Button size="sm" className="mt-auto bg-maroon-700 text-white hover:bg-maroon-800" onClick={() => openReview(k)}>
                  Review
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={Boolean(reviewing)} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent className="max-w-xl">
          {reviewing && (
            <>
              <DialogHeader>
                <DialogTitle>{reviewing.fullName}</DialogTitle>
                <DialogDescription>Review the submitted identity document before approving.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                {isImagePath(reviewing.documentUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fileUrl(reviewing.documentUrl)} alt="KYC document" className="max-h-[50vh] w-full rounded-xl border border-slate-200/70 object-contain dark:border-slate-800" />
                ) : (
                  <div className="grid h-40 place-items-center rounded-xl border border-slate-200/70 bg-slate-50 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-800/40">
                    No preview available for this file type.
                  </div>
                )}
                <a
                  href={fileUrl(reviewing.documentUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-maroon-700 hover:underline dark:text-maroon-300"
                >
                  Open full size <ExternalLink className="h-3 w-3" />
                </a>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200/70 p-3 text-sm dark:border-slate-800">
                  <div>
                    <p className="text-xs text-muted-foreground">ID type</p>
                    <p className="font-medium capitalize">{reviewing.idType.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ID number</p>
                    <p className="font-mono font-medium">{reviewing.idNumber}</p>
                  </div>
                </div>

                {rejecting && (
                  <Field label="Rejection reason (sent to the applicant)">
                    <Textarea rows={2} placeholder="Document unclear — please resubmit" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                  </Field>
                )}
              </DialogBody>
              <DialogFooter>
                {rejecting ? (
                  <>
                    <Button variant="ghost" onClick={() => setRejecting(false)} disabled={submitting}>Back</Button>
                    <Button variant="destructive" disabled={submitting} onClick={reject}>
                      <XCircle className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Confirm rejection"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" disabled={submitting} onClick={() => setRejecting(true)}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button className="bg-maroon-700 text-white hover:bg-maroon-800" disabled={submitting} onClick={approve}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> {submitting ? "Submitting..." : "Approve"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
