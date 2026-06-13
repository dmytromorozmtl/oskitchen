import type { Metadata } from "next";
import Link from "next/link";

import { ForbiddenClaimsTrainingQuiz } from "@/components/marketing/forbidden-claims-training-quiz";
import { PublicShell } from "@/components/marketing/public-page";
import { Badge } from "@/components/ui/badge";
import {
  FORBIDDEN_CLAIMS_TRAINING_EYEBROW,
  FORBIDDEN_CLAIMS_TRAINING_HEADLINE,
  FORBIDDEN_CLAIMS_TRAINING_SUBLINE,
} from "@/lib/marketing/forbidden-claims-training-content";
import {
  FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD,
  FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT,
  FORBIDDEN_CLAIMS_TRAINING_ROUTE,
} from "@/lib/marketing/forbidden-claims-training-policy";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Forbidden claims training — quiz & certification",
  description:
    "Sales & GTM certification: pass 8/10 on forbidden claims quiz before customer demos. SKIPPED ≠ PASS — honest Integration Health.",
  path: FORBIDDEN_CLAIMS_TRAINING_ROUTE,
  keywords: [
    "forbidden claims training",
    "sales certification",
    "integration health honesty",
    "OS Kitchen GTM",
  ],
});

/** Blueprint P1-84 — interactive forbidden claims quiz + certification. */
export default function ForbiddenClaimsTrainingPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6">
        <div className="space-y-4 text-center">
          <Badge variant="secondary" className="rounded-full">
            {FORBIDDEN_CLAIMS_TRAINING_EYEBROW}
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {FORBIDDEN_CLAIMS_TRAINING_HEADLINE}
          </h1>
          <p className="text-lg text-muted-foreground">{FORBIDDEN_CLAIMS_TRAINING_SUBLINE}</p>
          <p className="text-sm text-muted-foreground">
            Full modules:{" "}
            <Link href="/trust" className="font-medium text-primary hover:underline">
              Trust center
            </Link>
            {" · "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              docs/forbidden-claims-training.md
            </code>
            {" · "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              docs/forbidden-claims-team-cheat-sheet.md
            </code>
          </p>
        </div>

        <ForbiddenClaimsTrainingQuiz />

        <p className="text-center text-xs text-muted-foreground">
          Pass ≥{FORBIDDEN_CLAIMS_TRAINING_PASS_THRESHOLD}/{FORBIDDEN_CLAIMS_TRAINING_QUESTION_COUNT}{" "}
          before decks, email sequences, or live demos. Run{" "}
          <code className="rounded bg-muted px-1">npm run verify-claims</code> on release branches.
        </p>
      </section>
    </PublicShell>
  );
}
