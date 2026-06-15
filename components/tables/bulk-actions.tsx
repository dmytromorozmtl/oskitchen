"use client";

import { Download, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export type BulkActionsProps = {
  selectedCount: number;
  totalCount: number;
  onToggleAll: (checked: boolean) => void;
  onBulkStatus?: () => void;
  onBulkDelete?: () => void;
  onBulkExport?: () => void;
  statusLabel?: string;
  disabled?: boolean;
};

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onToggleAll,
  onBulkStatus,
  onBulkDelete,
  onBulkExport,
  statusLabel = "Update status",
  disabled = false,
}: BulkActionsProps) {
  if (totalCount === 0) return null;

  const allSelected = selectedCount > 0 && selectedCount === totalCount;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-muted/30 px-3 py-2">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(v) => onToggleAll(Boolean(v))}
          disabled={disabled}
          aria-label="Select all rows"
        />
        <span className="text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : "Select rows"}
        </span>
      </label>
      {selectedCount > 0 ? (
        <>
          {onBulkStatus ? (
            <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={onBulkStatus}>
              {statusLabel}
            </Button>
          ) : null}
          {onBulkExport ? (
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onBulkExport}>
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          ) : null}
          {onBulkDelete ? (
            <Button type="button" size="sm" variant="destructive" disabled={disabled} onClick={onBulkDelete}>
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
