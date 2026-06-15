"use client";

import { useState, useTransition } from "react";

import { deactivateRoleAction, upsertRoleAction } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RoleUpsertForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-2 md:grid-cols-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await upsertRoleAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save role.");
          }
        })
      }
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Key</span>
        <Input name="key" required placeholder="catering-lead" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Label</span>
        <Input name="label" required placeholder="Catering lead" />
      </label>
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Description</span>
        <Input name="description" />
      </label>
      <label className="text-sm md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">
          Permissions JSON (optional, e.g. {"{"}&quot;orders&quot;:&quot;edit&quot;,&quot;routes&quot;:&quot;view&quot;{"}"})
        </span>
        <Input name="permissionsJson" />
      </label>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save role"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}

export function RoleDeactivateButton({ roleId }: { roleId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          try { await deactivateRoleAction(formData); } catch { /* noop */ }
        })
      }
    >
      <input type="hidden" name="roleId" value={roleId} />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        Deactivate
      </Button>
    </form>
  );
}
