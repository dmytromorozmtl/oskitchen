"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { PREVIEW_MODULES_VISIBLE_BANNER } from "@/lib/navigation/preview-route-hiding-confirmation-policy";

export function PreviewModulesVisibleBanner() {
  return (
    <div
      className="mx-2 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-[11px] leading-snug text-amber-950 dark:text-amber-100"
      data-testid="preview-modules-visible-banner"
      role="status"
    >
      <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <p>
        {PREVIEW_MODULES_VISIBLE_BANNER}{" "}
        <Link href="/trust" className="font-medium underline underline-offset-2">
          Learn about maturity labels
        </Link>
      </p>
    </div>
  );
}
