import Link from 'next/link';
import { Users } from 'lucide-react';

/**
 * Honest pilot social proof — no brand logos until published with permission.
 */
export function PilotCohortStrip() {
  return (
    <section className="border-b border-border/60 bg-primary/[0.03] px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Users className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Now onboarding paid pilot operators</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Meal prep, restaurants, catering, and ghost kitchens in the US & Canada. Quotes below are from
              pilot conversations — illustrative until published case studies.
            </p>
          </div>
        </div>
        <Link
          href="/customers"
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          Read operator playbooks →
        </Link>
      </div>
    </section>
  );
}
