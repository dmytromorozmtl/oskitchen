"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { latestStaticRelease } from "@/lib/changelog/releases";

const STORAGE_KEY = "kitchenos_changelog_seen";

export function ChangelogBanner() {
  const latest = latestStaticRelease();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!latest) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    setVisible(seen !== latest.version);
  }, [latest?.version]);

  if (!latest || !visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, latest!.version);
    setVisible(false);
  }

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-primary/[0.04] px-4 py-3 text-sm pr-10">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="font-medium">
        What&apos;s new — {latest.title}{" "}
        <span className="text-muted-foreground font-normal">({latest.version})</span>
      </p>
      <p className="mt-1 text-muted-foreground line-clamp-2">{latest.summary}</p>
      <Link href="/changelog" className="mt-2 inline-block text-xs text-primary underline">
        View full changelog →
      </Link>
    </div>
  );
}
