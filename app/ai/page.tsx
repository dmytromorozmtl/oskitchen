import type { Metadata } from "next";

import { AiMoatsHonestPositioningContent } from "@/components/marketing/ai-moats-honest-positioning-content";
import { Hero, PublicShell } from "@/components/marketing/public-page";
import {
  AI_MOATS_HONEST_POSITIONING_HEADLINE,
  AI_MOATS_HONEST_POSITIONING_POLICY_ID,
  AI_MOATS_HONEST_POSITIONING_PRIMARY_CTA,
  AI_MOATS_HONEST_POSITIONING_PUBLIC_PATH,
} from "@/lib/marketing/ai-moats-honest-positioning-policy";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "AI modules — honest positioning for 7 proprietary moats",
  description:
    "What OS Kitchen AI modules actually do: Restaurant Brain, Digital Twin, Food Cost AI, and more — qualified maturity, not autonomous magic.",
  path: AI_MOATS_HONEST_POSITIONING_PUBLIC_PATH,
  keywords: [
    "restaurant AI honest positioning",
    "food cost AI beta",
    "kitchen operations AI modules",
    "OS Kitchen AI moats",
  ],
});

export default function AiMoatsHonestPositioningPage() {
  return (
    <PublicShell>
      <Hero
        eyebrow="AI honesty"
        title={AI_MOATS_HONEST_POSITIONING_HEADLINE}
        description="Each module ships in the codebase at pilot ready or BETA maturity. This page mirrors dashboard honesty labels — deterministic first, human-in-the-loop, no guaranteed ROI claims."
        cta={AI_MOATS_HONEST_POSITIONING_PRIMARY_CTA.label}
        ctaHref={AI_MOATS_HONEST_POSITIONING_PRIMARY_CTA.href}
        secondary="Trust center"
        secondaryHref="/trust"
      />
      <div data-ai-moats-policy={AI_MOATS_HONEST_POSITIONING_POLICY_ID}>
        <AiMoatsHonestPositioningContent />
      </div>
    </PublicShell>
  );
}
