"use client";

import { useState, useTransition } from "react";

import { archiveStaffAction } from "@/actions/staff";
import { Button } from "@/components/ui/button";

export function ArchiveStaffButton({ staffMemberId }: { staffMemberId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="inline-flex items-center gap-2"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await archiveStaffAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not archive.");
          }
        })
      }
    >
      <input type="hidden" name="staffMemberId" value={staffMemberId} />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Archiving…" : "Archive"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </form>
  );
}
