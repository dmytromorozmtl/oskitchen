"use client";

import { useState, useTransition } from "react";

import { recordApprovalAction } from "@/actions/go-live";
import { Button } from "@/components/ui/button";

const TYPES = [
  ["OPERATIONS", "Operations"],
  ["KITCHEN", "Kitchen"],
  ["FINANCE", "Finance"],
  ["INTEGRATIONS", "Integrations"],
  ["SUPPORT", "Support"],
  ["OWNERSHIP", "Ownership"],
] as const;

export function ApprovalButtons({
  projectId,
  existing,
}: {
  projectId: string;
  existing: { approvalType: string; approvedAt: Date; approvedBy: { fullName: string | null; email: string | null } }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const have = new Set(existing.map((a) => a.approvalType));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {TYPES.map(([type, label]) => {
          const owned = have.has(type);
          return (
            <form
              key={type}
              action={(formData) =>
                startTransition(async () => {
                  setError(null);
                  try {
                    await recordApprovalAction(formData);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not approve.");
                  }
                })
              }
            >
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="approvalType" value={type} />
              <input type="hidden" name="confirm" value="true" />
              <Button
                type="submit"
                size="sm"
                variant={owned ? "outline" : "default"}
                disabled={isPending}
              >
                {owned ? `${label} ✓` : `Approve ${label}`}
              </Button>
            </form>
          );
        })}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {existing.length > 0 ? (
        <ul className="text-xs text-muted-foreground">
          {existing.map((a) => (
            <li key={a.approvalType}>
              {a.approvalType}: {a.approvedBy.fullName ?? a.approvedBy.email ?? "—"} ·
              {" "}{a.approvedAt.toISOString().slice(0, 10)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
