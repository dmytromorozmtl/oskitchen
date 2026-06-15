import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { MarketingCard } from "@/components/marketing/card";
import { SectionHeader } from "@/components/marketing/section-header";
import { appIconHeaderClass, appIconHeroClass } from "@/lib/design/icon-system";
import {
  AI_HONESTY_LABELS,
  AI_MATURITY_LABELS,
  AI_METHOD_LABELS,
  type AiModuleId,
} from "@/lib/ai/ai-honesty-labels";
import {
  AI_MOATS_CORE_MODULE_IDS,
  AI_MOATS_HONEST_POSITIONING_CROSS_CUTTING_RULES,
  AI_MOATS_HONEST_POSITIONING_FORBIDDEN_CLAIMS,
  AI_MOATS_HONEST_POSITIONING_POLICY_ID,
  AI_MOATS_HONEST_POSITIONING_PRIMARY_CTA,
} from "@/lib/marketing/ai-moats-honest-positioning-policy";
import { cn } from "@/lib/utils";

function coreMoatLabels() {
  const ids = new Set<AiModuleId>(AI_MOATS_CORE_MODULE_IDS);
  return AI_HONESTY_LABELS.filter((entry) => ids.has(entry.moduleId));
}

const SAFE_UMBRELLA_CLAIMS = [
  "7 proprietary AI modules in production (qualified per module maturity)",
  "AI-assisted operations hub — demo shows Today + at least one moat with honest labels",
  "Deterministic daily briefing on Today Command Center",
  "Human-in-the-loop purchasing recommendations with approval gate visible",
] as const;

/** MKT-17 — public honest positioning for seven AI moats + copilot note. */
export function AiMoatsHonestPositioningContent() {
  const moats = coreMoatLabels();
  const copilotSurfaces = AI_HONESTY_LABELS.filter(
    (entry) => entry.moduleId === "operations-copilot" || entry.moduleId === "restaurant-co-pilot",
  );

  return (
    <>
      <section
        className="border-t border-border/60 py-16 sm:py-20"
        data-testid="ai-moats-honest-positioning-page"
        data-ai-moats-policy={AI_MOATS_HONEST_POSITIONING_POLICY_ID}
        aria-labelledby="ai-moats-modules-heading"
      >
        <SectionHeader
          tag="Seven modules"
          title="What each AI module actually does"
          description="Engineering tracker 22/22 means code shipped — not every workflow is LIVE for every tenant. Maturity badges match dashboard labels."
          centered
          className="mx-auto"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {moats.map((moat) => (
            <MarketingCard key={moat.moduleId} className="flex h-full flex-col">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-lg font-semibold tracking-tight">{moat.moduleName}</h3>
                <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                  {AI_MATURITY_LABELS[moat.maturity]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {moat.methodDescription}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">{moat.disclaimer}</p>
              {moat.routes[0] ? (
                <p className="mt-auto pt-4 text-xs font-mono text-muted-foreground">{moat.routes[0]}</p>
              ) : null}
            </MarketingCard>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 py-16 sm:py-20">
        <SectionHeader
          tag="Copilot surfaces"
          title="Optional LLM and co-pilot paths"
          description="Separate from the seven core moats — preview maturity with human approval on drafts."
          centered
          className="mx-auto"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {copilotSurfaces.map((surface) => (
            <MarketingCard key={surface.moduleId} className="h-full">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-lg font-semibold tracking-tight">{surface.moduleName}</h3>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  {AI_MATURITY_LABELS[surface.maturity]}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{surface.methodDescription}</p>
              <p className="mt-2 text-xs text-muted-foreground">{surface.disclaimer}</p>
            </MarketingCard>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border/80 bg-muted/30 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5"
              aria-hidden
            >
              <CheckCircle2 className={cn(appIconHeroClass, "text-primary")} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="ai-moats-modules-heading" className="text-lg font-semibold tracking-tight">
                Cross-cutting honesty rules
              </h2>
              <ul className="mt-4 space-y-2">
                {AI_MOATS_HONEST_POSITIONING_CROSS_CUTTING_RULES.map((rule) => (
                  <li key={rule} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2
                      className={cn("mt-0.5 shrink-0 text-primary", appIconHeaderClass)}
                      aria-hidden
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 py-16 sm:py-20">
        <SectionHeader
          tag="Sales-safe"
          title="Safe umbrella claims"
          description="Use these in decks and demos when module-specific evidence is visible."
          centered
          className="mx-auto"
        />
        <ul className="mx-auto mt-10 max-w-3xl space-y-3">
          {SAFE_UMBRELLA_CLAIMS.map((claim) => (
            <li
              key={claim}
              className="flex gap-2 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground"
            >
              <CheckCircle2 className={cn("mt-0.5 shrink-0 text-primary", appIconHeaderClass)} aria-hidden />
              {claim}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border/60 py-16 sm:py-20">
        <SectionHeader
          tag="Do not say"
          title="Forbidden umbrella claims"
          description="Run copy through verify-claims before publishing. Method labels below are for internal reference."
          centered
          className="mx-auto"
        />
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex gap-3">
            <AlertTriangle className={cn("shrink-0 text-destructive", appIconHeroClass)} aria-hidden />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {AI_MOATS_HONEST_POSITIONING_FORBIDDEN_CLAIMS.map((claim) => (
                <li key={claim} className="capitalize">
                  {claim}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-muted-foreground">
          Method types:{" "}
          {Object.values(AI_METHOD_LABELS)
            .slice(0, 3)
            .join(" · ")}
          …
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-12 text-center">
        <Link
          href={AI_MOATS_HONEST_POSITIONING_PRIMARY_CTA.href}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {AI_MOATS_HONEST_POSITIONING_PRIMARY_CTA.label}
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/trust" className="underline hover:text-foreground">
            BETA / SKIPPED labels
          </Link>
          {" · "}
          <Link href="/integrations" className="underline hover:text-foreground">
            Integration matrix
          </Link>
          {" · "}
          <Link href="/book-demo" className="underline hover:text-foreground">
            Book demo
          </Link>
        </p>
      </section>
    </>
  );
}
