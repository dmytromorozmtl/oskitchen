"use client";

import { useState, useTransition } from "react";

import { issueCertificationAction, revokeCertificationAction } from "@/actions/training";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CERTIFICATION_TYPES = [
  ["KITCHEN_CERTIFIED", "Kitchen certified"],
  ["PACKING_CERTIFIED", "Packing certified"],
  ["ROUTE_CERTIFIED", "Route certified"],
  ["MANAGER_CERTIFIED", "Manager certified"],
  ["SAFETY_CERTIFIED", "Safety certified"],
  ["CATERING_CERTIFIED", "Catering certified"],
  ["CUSTOMER_SERVICE_CERTIFIED", "Customer service certified"],
  ["ALLERGEN_CERTIFIED", "Allergen certified"],
  ["CUSTOM", "Custom"],
] as const;

export function IssueCertForm({
  staff,
}: {
  staff: { id: string; name: string; email: string | null }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-2 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await issueCertificationAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not issue certification.");
          }
        })
      }
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Certification</span>
        <select name="certificationType" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {CERTIFICATION_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Recipient (staff)</span>
        <select name="recipientStaffId" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">— pick a staff member —</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}{s.email ? ` (${s.email})` : ""}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Recipient name</span>
        <Input name="recipientName" placeholder="Optional" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Recipient email</span>
        <Input name="recipientEmail" type="email" placeholder="Optional" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Expires at (optional)</span>
        <Input name="expiresAt" type="date" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Notes</span>
        <Input name="notes" placeholder="Optional" />
      </label>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Issuing…" : "Issue certification"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}

export function RevokeCertForm({ certId }: { certId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  return (
    <form
      className="flex flex-wrap items-center gap-2 text-xs"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await revokeCertificationAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not revoke.");
          }
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
      {error ? <span className="text-destructive">{error}</span> : null}
    </form>
  );
}
