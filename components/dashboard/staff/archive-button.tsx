"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { archiveStaffAction } from "@/actions/staff";
import { FormActionInlineFeedback } from "@/components/feedback/form-action-inline-feedback";
import { Button } from "@/components/ui/button";
import { notifyActionResult } from "@/lib/feedback/notify-action-result";

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
            notifyActionResult(undefined, { successMessage: "Staff member archived" });
          } catch (e) {
            const message = e instanceof Error ? e.message : "Could not archive.";
            setError(message);
            toast.error(message);
          }
        })
      }
    >
      <input type="hidden" name="staffMemberId" value={staffMemberId} />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Archiving…" : "Archive"}
      </Button>
      <FormActionInlineFeedback message={error} variant="error" />
    </form>
  );
}
