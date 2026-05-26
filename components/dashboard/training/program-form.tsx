"use client";

import { useState, useTransition } from "react";

import { createProgramAction } from "@/actions/training";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLE_TYPES = [
  ["KITCHEN_STAFF", "Kitchen staff"],
  ["PACKING_STAFF", "Packing staff"],
  ["MANAGER", "Manager"],
  ["DELIVERY_DRIVER", "Delivery driver"],
  ["PREP_COOK", "Prep cook"],
  ["LINE_COOK", "Line cook"],
  ["EXECUTIVE_CHEF", "Executive chef"],
  ["OPERATIONS_MANAGER", "Operations manager"],
  ["INVENTORY_MANAGER", "Inventory manager"],
  ["CATERING_COORDINATOR", "Catering coordinator"],
  ["CUSTOMER_SUPPORT", "Customer support"],
  ["ADMIN", "Admin"],
  ["IMPLEMENTATION_MANAGER", "Implementation manager"],
  ["GENERAL", "General"],
] as const;

const DIFFICULTIES = [
  ["BEGINNER", "Beginner"],
  ["INTERMEDIATE", "Intermediate"],
  ["ADVANCED", "Advanced"],
  ["EXPERT", "Expert"],
] as const;

const LANGUAGES = [
  ["EN", "English"],
  ["FR", "Français"],
  ["ES", "Español"],
  ["DE", "Deutsch"],
] as const;

export function ProgramForm({
  brands,
  locations,
}: {
  brands: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await createProgramAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create program.");
          }
        })
      }
    >
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Title</span>
        <Input name="title" required placeholder="e.g. Kitchen staff onboarding" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Role</span>
        <select name="roleType" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {ROLE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Difficulty</span>
        <select name="difficulty" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {DIFFICULTIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Language</span>
        <select name="language" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {LANGUAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Estimated minutes</span>
        <Input name="estimatedMinutes" type="number" defaultValue={60} min={5} max={2000} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Brand (optional)</span>
        <select name="brandId" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Location (optional)</span>
        <select name="locationId" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All locations</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Seed lessons from role template</span>
        <select name="seedFromTemplate" defaultValue="" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">No template</option>
          {ROLE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Description</span>
        <textarea name="description" className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isOnboardingPath" value="true" />
        <span>Onboarding path</span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="practiceModeOnly" value="true" />
        <span>Practice mode only (no production writes)</span>
      </label>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create program"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
