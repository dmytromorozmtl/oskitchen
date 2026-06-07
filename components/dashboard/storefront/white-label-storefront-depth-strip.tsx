import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WHITE_LABEL_STOREFRONT_DEPTH_ROUTE } from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";

export function WhiteLabelStorefrontDepthStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="white-label-storefront-depth-strip"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">White-label storefront depth</p>
          <p className="text-sm text-muted-foreground">
            ChowNow parity dashboard — branded theme, custom domain posture, direct ordering, catering
            pages, and PWA install. BETA honesty labels; SKIPPED when DNS automation is not shipped.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href={WHITE_LABEL_STOREFRONT_DEPTH_ROUTE}>Open depth dashboard</Link>
      </Button>
    </div>
  );
}
