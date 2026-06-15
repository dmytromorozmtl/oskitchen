"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ClipboardCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PackingVerifyAttentionTab } from "@/lib/packing-verification/packing-verify-focus-era18-policy";
import {
  pickPackingVerifyAttentionItems,
  summarizePackingVerifyFocus,
  type PackingVerifyFocusSnapshot,
  type PackingVerifyItemFocus,
  type PackingVerifyOpenSessionFocus,
} from "@/lib/packing-verification/packing-verify-focus-era18";

export function PackingVerifyAttentionStrip(props: {
  focus: PackingVerifyFocusSnapshot;
  openSessions: readonly PackingVerifyOpenSessionFocus[];
  sessionItems?: readonly PackingVerifyItemFocus[];
  onTabChange: (tab: PackingVerifyAttentionTab) => void;
}) {
  const summary = summarizePackingVerifyFocus(props.focus);
  const items = pickPackingVerifyAttentionItems(
    props.openSessions,
    props.focus,
    props.sessionItems ?? [],
  );

  if (items.length === 0) return null;

  return (
    <Card
      className="border-rose-200/80 bg-rose-50/40 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20"
      data-testid="packing-verify-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-muted-foreground" aria-hidden />
          <AlertTriangle className="h-5 w-5 text-rose-600" aria-hidden />
          Packing verify — handle these first
        </CardTitle>
        <CardDescription>
          {summary.hasUrgent
            ? "Flagged lines, allergen checks, and open sessions prioritized before pass."
            : `${summary.totalSignals} open verify signal${summary.totalSignals === 1 ? "" : "s"} on this station.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`packing-verify-attention-${item.id}`}
            onClick={(event) => {
              if (!item.tab) return;
              event.preventDefault();
              props.onTabChange(item.tab);
              const target = document.querySelector(item.href);
              target?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm hover:bg-muted/40"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
