"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Bug, HelpCircle, MessageSquare, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SupportWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open ? (
        <Button
          type="button"
          size="icon"
          aria-label="Open help and support"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      ) : (
        <div className="w-80 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Help &amp; Support</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Close support panel"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1 p-3">
            <Link
              href="/dashboard/support"
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <MessageSquare className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Contact Support</p>
                <p className="text-xs text-muted-foreground">We reply within 2 hours</p>
              </div>
            </Link>
            <Link
              href="/dashboard/support"
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <Bug className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Report a Bug</p>
                <p className="text-xs text-muted-foreground">Help us improve OS Kitchen</p>
              </div>
            </Link>
            <Link
              href="/dashboard/support/kb"
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <BookOpen className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Knowledge Base</p>
                <p className="text-xs text-muted-foreground">Guides &amp; tutorials</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
