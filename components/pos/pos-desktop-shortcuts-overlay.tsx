"use client";

import { X } from "lucide-react";

import { posShortcutGroups } from "@/lib/keyboard/shortcuts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const GROUP_LABELS = {
  navigation: "Navigation",
  cart: "Cart",
  payment: "Payment",
  display: "Display",
} as const;

export function PosDesktopShortcutsOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="POS keyboard shortcuts"
      data-testid="pos-desktop-shortcuts-overlay"
    >
      <Card className="max-h-[85vh] w-full max-w-2xl overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Desktop POS shortcuts</CardTitle>
            <CardDescription>
              Function keys for counter terminals. Number keys 1–9 quick-add visible products.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={onClose}
            aria-label="Close shortcuts"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {posShortcutGroups().map(({ group, shortcuts }) => (
            <div key={group} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {GROUP_LABELS[group]}
              </p>
              <ul className="space-y-1.5 text-sm">
                {shortcuts.map((shortcut) => (
                  <li
                    key={`${shortcut.key}-${shortcut.action}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2"
                  >
                    <span>{shortcut.label}</span>
                    <kbd className="rounded-md border bg-muted px-2 py-0.5 font-mono text-xs">
                      {shortcut.key}
                    </kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
