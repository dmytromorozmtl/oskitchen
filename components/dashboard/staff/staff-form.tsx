"use client";

import { useState, useTransition } from "react";

import { createStaffAction, updateStaffAction } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLE_TYPES = [
  ["OWNER", "Owner / Admin"], ["MANAGER", "Manager"], ["KITCHEN_LEAD", "Kitchen lead"],
  ["PREP_COOK", "Prep cook"], ["LINE_COOK", "Line cook"], ["PACKER", "Packer"],
  ["DRIVER", "Driver"], ["CUSTOMER_SERVICE", "Customer service"],
  ["CATERING_COORDINATOR", "Catering coordinator"], ["PURCHASING", "Purchasing"],
  ["INVENTORY", "Inventory"], ["ACCOUNTING", "Accounting"], ["MARKETING", "Marketing"],
  ["VIEWER", "Viewer"], ["CUSTOM", "Custom"],
] as const;

const STATUSES = [
  ["ACTIVE", "Active"], ["INVITED", "Invited"], ["TRAINING", "Training"],
  ["PAUSED", "Paused"], ["INACTIVE", "Inactive"], ["ARCHIVED", "Archived"],
] as const;

const EMPLOYMENT_TYPES = [
  ["FULL_TIME", "Full-time"], ["PART_TIME", "Part-time"],
  ["CONTRACTOR", "Contractor"], ["TEMPORARY", "Temporary"],
  ["SEASONAL", "Seasonal"], ["VOLUNTEER", "Volunteer"], ["CUSTOM", "Custom"],
] as const;

export type StaffFormDefaults = {
  staffMemberId?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  roleType?: string | null;
  status?: string | null;
  employmentType?: string | null;
  brandId?: string | null;
  locationId?: string | null;
  notes?: string | null;
};

export function StaffForm({
  brands,
  locations,
  customRoles,
  defaults,
  mode = "create",
}: {
  brands: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  customRoles: { id: string; label: string }[];
  defaults?: StaffFormDefaults;
  mode?: "create" | "edit";
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const action = mode === "edit" ? updateStaffAction : createStaffAction;

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await action(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save teammate.");
          }
        })
      }
    >
      {mode === "edit" && defaults?.staffMemberId ? (
        <input type="hidden" name="staffMemberId" value={defaults.staffMemberId} />
      ) : null}

      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Name</span>
        <Input name="name" required defaultValue={defaults?.name ?? ""} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Email</span>
        <Input name="email" type="email" defaultValue={defaults?.email ?? ""} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Phone</span>
        <Input name="phone" defaultValue={defaults?.phone ?? ""} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Role type</span>
        <select name="roleType" defaultValue={defaults?.roleType ?? "CUSTOM"} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {ROLE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Role label</span>
        <Input name="role" placeholder="chef, driver, gm…" defaultValue={defaults?.role ?? ""} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Status</span>
        <select name="status" defaultValue={defaults?.status ?? "ACTIVE"} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Employment type</span>
        <select name="employmentType" defaultValue={defaults?.employmentType ?? "CUSTOM"} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {EMPLOYMENT_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Brand (optional)</span>
        <select name="brandId" defaultValue={defaults?.brandId ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Location (optional)</span>
        <select name="locationId" defaultValue={defaults?.locationId ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All locations</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </label>
      {customRoles.length > 0 ? (
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Custom role (optional)</span>
          <select name="customRoleId" defaultValue="" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">— none —</option>
            {customRoles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>
      ) : null}
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Notes</span>
        <textarea name="notes" defaultValue={defaults?.notes ?? ""} className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </label>
      <div className="md:col-span-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : mode === "edit" ? "Save changes" : "Save teammate"}
        </Button>
        <span>SSO/login invitations are not yet wired up. Teammates here power task assignment and operational role visibility.</span>
        {error ? <p className="text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
