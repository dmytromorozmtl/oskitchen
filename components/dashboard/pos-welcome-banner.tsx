"use client";

import Link from "next/link";
import { PartyPopper, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function PosWelcomeBanner() {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="flex gap-3">
        <PartyPopper className="h-6 w-6 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">You&apos;re ready — take your first order</p>
          <p className="text-sm text-muted-foreground">
            Pick a register, add items to the cart, and complete checkout. Your kitchen display
            updates automatically.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/products">View menu</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
