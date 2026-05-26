import { CASE_STUDIES } from '@/lib/marketing/case-studies';

/** Honest segment avatars — monograms, not brand logos. */
export function CustomerSegmentStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
      {CASE_STUDIES.map((study) => (
        <div
          key={study.id}
          className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background px-4 py-3 shadow-card"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary"
            aria-hidden
          >
            {study.monogram}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{study.segment}</p>
            <p className="text-xs text-muted-foreground">
              {study.status === 'pilot' ? 'Pilot cohort playbook' : 'Verified story'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
