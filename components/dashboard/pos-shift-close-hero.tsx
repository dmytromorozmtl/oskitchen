import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildPosShiftCloseOpenShiftSummary,
  type PosShiftCloseOpenShiftSummary,
} from "@/lib/pos/pos-shift-close-clarity-era19";
import { POS_SHIFT_CLOSE_FORM_ANCHOR } from "@/lib/pos/pos-shift-close-clarity-era19-policy";

type PosShiftCloseHeroProps = {
  previews: readonly PosShiftCloseOpenShiftSummary[];
};

export function PosShiftCloseHero({ previews }: PosShiftCloseHeroProps) {
  if (previews.length === 0) return null;

  const primary = previews[0]!;
  const summary = buildPosShiftCloseOpenShiftSummary(primary);
  const closeHref = `#${POS_SHIFT_CLOSE_FORM_ANCHOR}`;

  return (
    <Card
      className="border-primary/20 bg-primary/5 shadow-sm"
      data-testid="pos-shift-close-hero"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" aria-hidden />
          End-of-shift closeout
        </CardTitle>
        <CardDescription>
          {previews.length === 1
            ? "One register still open — count the drawer and close when service ends."
            : `${previews.length} registers open — close each drawer before leaving.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold">{summary.headline}</p>
          <p className="text-sm text-muted-foreground">{summary.subline}</p>
          <p className="text-sm">
            Expected in drawer{" "}
            <span className="font-semibold tabular-nums">{summary.expectedCashLabel}</span>
          </p>
        </div>
        <Button asChild className="w-full rounded-full sm:w-auto" data-testid="pos-shift-close-hero-cta">
          <Link href={closeHref}>
            Start closeout
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
