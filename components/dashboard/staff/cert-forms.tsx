"use client";

import { useState, useTransition } from "react";

import { revokeStaffCertificationAction, upsertStaffCertificationAction } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUSES = [
  ["ACTIVE", "Active"], ["PENDING", "Pending"], ["EXPIRED", "Expired"], ["REVOKED", "Revoked"],
] as const;

export function AddCertificationForm({ staffMemberId }: { staffMemberId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-2 md:grid-cols-3"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await upsertStaffCertificationAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save certification.");
          }
        })
      }
    >
      <input type="hidden" name="staffMemberId" value={staffMemberId} />
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Certification</span>
        <Input name="certificationType" required placeholder="ServSafe, Allergen, …" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Status</span>
        <select name="status" defaultValue="ACTIVE" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Issued</span>
        <Input name="issuedAt" type="date" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Expires</span>
        <Input name="expiresAt" type="date" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Notes</span>
        <Input name="notes" />
      </label>
      <div className="md:col-span-3 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save certification"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}

export function RevokeCertButton({ certId }: { certId: string }) {
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  return (
    <form
      className="flex flex-wrap items-center gap-2 text-xs"
      action={(formData) =>
        startTransition(async () => {
          try { await revokeStaffCertificationAction(formData); } catch { /* noop */ }
        })
      }
    >
      <input type="hidden" name="certId" value={certId} />
      <Input
        name="reason"
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.currentTarget.value)}
      />
      <Button type="submit" size="sm" variant="destructive" disabled={isPending || !reason}>
        Revoke
      </Button>
    </form>
  );
}
