import Link from "next/link";
import { Activity, Bell, BookOpen, ArrowRight } from "lucide-react";

import {
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_CTA,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_EYEBROW,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_HEADLINE,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_STEPS,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_SUBLINE,
} from "@/lib/marketing/integration-health-marketing-content";
import { INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID } from "@/lib/marketing/integration-health-marketing-policy";
import { cn } from "@/lib/utils";

const STEP_ICONS = {
  activity: Activity,
  bell: Bell,
  book: BookOpen,
} as const;

type Props = {
  className?: string;
  variant?: "default" | "compact";
};

/** Blueprint P1-73 — dedicated Integration Health explainer landing section. */
export function IntegrationHealthMarketingExplainerSection({
  className,
  variant = "default",
}: Props) {
  const compact = variant === "compact";

  return (
    <section
      className={cn(
        "border-t border-border/60",
        compact ? "py-10 sm:py-12" : "py-16 sm:py-20",
        className,
      )}
      data-testid={INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID}
      aria-labelledby="integration-health-explainer-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={cn("mx-auto text-center", compact ? "max-w-3xl" : "max-w-4xl")}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {INTEGRATION_HEALTH_MARKETING_EXPLAINER_EYEBROW}
          </p>
          <h2
            id="integration-health-explainer-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {INTEGRATION_HEALTH_MARKETING_EXPLAINER_HEADLINE}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {INTEGRATION_HEALTH_MARKETING_EXPLAINER_SUBLINE}
          </p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {INTEGRATION_HEALTH_MARKETING_EXPLAINER_STEPS.map((step) => {
            const Icon = STEP_ICONS[step.icon as keyof typeof STEP_ICONS] ?? Activity;
            return (
              <li
                key={step.id}
                className="relative rounded-2xl border border-border/80 bg-card/50 p-6"
                data-testid={`integration-health-explainer-step-${step.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {step.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          SKIPPED means partner credentials missing — not fake green. BETA channels are labeled
          honestly. Health scores are operational signals — not guaranteed uptime.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href={INTEGRATION_HEALTH_MARKETING_EXPLAINER_CTA.href}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {INTEGRATION_HEALTH_MARKETING_EXPLAINER_CTA.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
