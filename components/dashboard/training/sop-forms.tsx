"use client";

import { useState, useTransition } from "react";

import {
  acknowledgeSopAction,
  archiveSopAction,
  createSopAction,
  publishSopAction,
} from "@/actions/training";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SOP_CATEGORIES = [
  ["KITCHEN_PREP", "Kitchen prep"],
  ["FOOD_SAFETY", "Food safety"],
  ["ALLERGEN_HANDLING", "Allergen handling"],
  ["PACKING", "Packing"],
  ["DELIVERY", "Delivery"],
  ["CUSTOMER_SERVICE", "Customer service"],
  ["OPENING", "Opening"],
  ["CLOSING", "Closing"],
  ["CLEANING", "Cleaning"],
  ["INVENTORY", "Inventory"],
  ["EMERGENCIES", "Emergencies"],
  ["CATERING", "Catering"],
  ["CASH_HANDLING", "Cash handling"],
  ["EQUIPMENT_MAINTENANCE", "Equipment maintenance"],
  ["OTHER", "Other"],
] as const;

const LANGUAGES = [
  ["EN", "English"],
  ["FR", "Français"],
  ["ES", "Español"],
  ["DE", "Deutsch"],
] as const;

export function CreateSopForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-2 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await createSopAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create SOP.");
          }
        })
      }
    >
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Title</span>
        <Input name="title" required />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Category</span>
        <select name="category" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {SOP_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Language</span>
        <select name="language" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {LANGUAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Summary (optional)</span>
        <Input name="summary" />
      </label>
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Content (markdown supported)</span>
        <textarea
          name="content"
          required
          className="min-h-[160px] w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="requiresAcknowledgement" defaultChecked value="true" />
        <span>Requires acknowledgement</span>
      </label>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save draft"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}

export function SopStatusButtons({ sopId, status }: { sopId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function publish() {
    const fd = new FormData();
    fd.append("sopId", sopId);
    startTransition(async () => {
      setError(null);
      try { await publishSopAction(fd); }
      catch (e) { setError(e instanceof Error ? e.message : "Could not publish."); }
    });
  }
  function archive() {
    const fd = new FormData();
    fd.append("sopId", sopId);
    startTransition(async () => {
      setError(null);
      try { await archiveSopAction(fd); }
      catch (e) { setError(e instanceof Error ? e.message : "Could not archive."); }
    });
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {status !== "ACTIVE" ? (
        <Button type="button" size="sm" onClick={publish} disabled={isPending}>
          Publish
        </Button>
      ) : null}
      {status !== "ARCHIVED" ? (
        <Button type="button" size="sm" variant="outline" onClick={archive} disabled={isPending}>
          Archive
        </Button>
      ) : null}
      {error ? <span className="text-destructive">{error}</span> : null}
    </div>
  );
}

export function AcknowledgeSopForm({
  sopId,
  staff,
}: {
  sopId: string;
  staff: { id: string; name: string; email: string | null }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await acknowledgeSopAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not acknowledge.");
          }
        })
      }
    >
      <input type="hidden" name="sopId" value={sopId} />
      <label className="text-xs">
        <span className="mb-1 block text-[10px] text-muted-foreground">Staff member</span>
        <select name="acknowledgedStaffId" className="rounded-md border bg-background px-2 py-1 text-xs">
          <option value="">— self —</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <label className="text-xs">
        <span className="mb-1 block text-[10px] text-muted-foreground">Notes</span>
        <Input name="notes" placeholder="Optional notes" />
      </label>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Acknowledge"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
