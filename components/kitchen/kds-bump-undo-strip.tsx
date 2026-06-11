"use client";

import { Button } from "@/components/ui/button";
import {
  KDS_BUMP_TICKET_UNDO_BUTTON_TEST_ID,
  KDS_BUMP_TICKET_UNDO_STRIP_TEST_ID,
} from "@/lib/design/kds-bump-ticket-ux-policy";

export function KdsBumpUndoStrip(props: {
  ticketLabel: string;
  onUndo: () => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300/80 bg-emerald-50/80 px-4 py-3 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/40"
      role="status"
      aria-live="polite"
      data-testid={KDS_BUMP_TICKET_UNDO_STRIP_TEST_ID}
    >
      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
        Bumped {props.ticketLabel} — moved to expo
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 rounded-full border-emerald-400 bg-background touch-manipulation"
        data-testid={KDS_BUMP_TICKET_UNDO_BUTTON_TEST_ID}
        onClick={props.onUndo}
      >
        Undo (3s)
      </Button>
    </div>
  );
}
