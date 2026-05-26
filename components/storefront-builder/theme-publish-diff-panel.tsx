"use client";

import * as React from "react";

import type { ThemePublishDiffLine } from "@/lib/storefront/theme-publish-diff";

export function ThemePublishDiffPanel({ lines }: { lines: ThemePublishDiffLine[] }) {
  const [open, setOpen] = React.useState(false);
  if (lines.length === 0) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
      <button
        type="button"
        className="font-medium text-foreground underline-offset-4 hover:underline"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide" : "Show"} changes in this publish
      </button>
      {open ? (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
          {lines.map((l, i) => (
            <li key={`${l.area}-${i}`}>{l.summary}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
