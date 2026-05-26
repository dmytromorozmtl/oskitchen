"use client";

import { useState, useTransition } from "react";

import {
  bulkApproveSafeAction,
  bulkArchiveAction,
  bulkIgnoreAction,
} from "@/actions/product-mapping";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  externalTitle: string;
  confidenceLabel: string | null;
  candidateTitle: string | null;
  bulkEligible: boolean;
};

export function BulkActionsTable({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function selectAllEligible() {
    setSelected(new Set(rows.filter((r) => r.bulkEligible).map((r) => r.id)));
  }
  function clearAll() {
    setSelected(new Set());
  }

  function runBulk(action: (formData: FormData) => Promise<void>, label: string) {
    if (selected.size === 0) return;
    const formData = new FormData();
    for (const id of selected) formData.append("mappingIds", id);
    formData.append("confirm", "true");
    startTransition(async () => {
      setError(null);
      setOutcome(null);
      try {
        await action(formData);
        setOutcome(`${label}: ${selected.size} row(s) updated.`);
        setSelected(new Set());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Bulk action failed.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        Bulk approve only sends rows that already meet the high-trust confidence ladder (exact SKU/title or high
        score). Everything else stays in the queue until you review it manually — this avoids silent wrong-item prep.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={selectAllEligible} disabled={isPending}>
          Select bulk-eligible
        </Button>
        <Button size="sm" variant="ghost" onClick={clearAll} disabled={isPending || selected.size === 0}>
          Clear
        </Button>
        <span className="text-xs text-muted-foreground">
          {selected.size} of {rows.length} selected
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => runBulk(bulkApproveSafeAction, "Approved")}
            disabled={isPending || selected.size === 0}
          >
            Bulk approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runBulk(bulkIgnoreAction, "Ignored")}
            disabled={isPending || selected.size === 0}
          >
            Ignore
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => runBulk(bulkArchiveAction, "Archived")}
            disabled={isPending || selected.size === 0}
          >
            Archive
          </Button>
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {outcome ? <p className="text-xs text-emerald-700">{outcome}</p> : null}

      <table className="w-full min-w-[720px] text-left text-xs">
        <thead>
          <tr className="border-b bg-muted/40 text-muted-foreground">
            <th className="px-3 py-2 font-medium w-8"></th>
            <th className="px-3 py-2 font-medium">External title</th>
            <th className="px-3 py-2 font-medium">Candidate</th>
            <th className="px-3 py-2 font-medium">Confidence</th>
            <th className="px-3 py-2 font-medium">Bulk-eligible</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                Nothing to bulk-process right now.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => toggle(row.id)}
                    disabled={!row.bulkEligible}
                  />
                </td>
                <td className="px-3 py-2">{row.externalTitle}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.candidateTitle ?? "—"}</td>
                <td className="px-3 py-2">{row.confidenceLabel ?? "—"}</td>
                <td className="px-3 py-2">
                  {row.bulkEligible ? (
                    <span className="text-emerald-700">Yes</span>
                  ) : (
                    <span className="text-muted-foreground">Manual only</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
