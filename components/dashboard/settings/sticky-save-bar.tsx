"use client";

import { Loader2, RotateCcw, Save } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StickySaveBarProps = {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  /** Optional helper text shown when dirty. */
  message?: string;
  /** Disable the save button (e.g. validation). */
  disabled?: boolean;
};

export function StickySaveBar({ dirty, saving, onSave, onDiscard, message, disabled }: StickySaveBarProps) {
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center px-3 transition-all sm:bottom-6",
        dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-10 opacity-0",
      )}
      aria-hidden={!dirty}
    >
      <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-3 rounded-full border border-border/80 bg-background/95 px-4 py-2 shadow-lg backdrop-blur">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {message ?? "Unsaved changes"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={saving}
            aria-label="Discard changes"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden />
            Discard
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={disabled || saving}
            aria-label="Save settings"
          >
            {saving ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Save className="mr-1 h-3.5 w-3.5" aria-hidden />
            )}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
