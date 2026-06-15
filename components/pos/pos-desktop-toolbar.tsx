"use client";

import { Keyboard, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PosDesktopToolbar({
  customerDisplayActive,
  onToggleCustomerDisplay,
  onShowShortcuts,
}: {
  customerDisplayActive: boolean;
  onToggleCustomerDisplay: () => void;
  onShowShortcuts: () => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card/80 px-3 py-2"
      data-testid="pos-desktop-toolbar"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="rounded-full text-[10px] uppercase">
          Desktop POS
        </Badge>
        <span>F1 search · F4 checkout · F8 customer display · ? help</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={customerDisplayActive ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={onToggleCustomerDisplay}
          data-testid="pos-customer-display-toggle"
        >
          <Monitor className="mr-1.5 h-4 w-4" aria-hidden />
          Customer display {customerDisplayActive ? "on" : "off"}
          <span className="ml-1.5 hidden font-mono text-[10px] opacity-70 sm:inline">F8</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={onShowShortcuts}
          data-testid="pos-shortcuts-help"
        >
          <Keyboard className="mr-1.5 h-4 w-4" aria-hidden />
          Shortcuts
          <span className="ml-1.5 hidden font-mono text-[10px] opacity-70 sm:inline">F9</span>
        </Button>
      </div>
    </div>
  );
}
