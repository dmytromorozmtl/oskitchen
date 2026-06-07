import { MarketingCard } from "@/components/marketing/card";
import { SectionHeader } from "@/components/marketing/section-header";
import {
  VERTICAL_MESSAGING_HONESTY_NOTE,
  VERTICAL_MESSAGING_PRIMARY_HEADLINE,
  VERTICAL_MESSAGING_PRIMARY_SUBHEADLINE,
  VERTICAL_MESSAGING_SEGMENTS,
} from "@/lib/marketing/vertical-specific-messaging-content";

export function VerticalSpecificMessagingSection() {
  return (
    <section
      className="border-t border-border/60 py-16 sm:py-20"
      data-testid="vertical-specific-messaging"
    >
      <SectionHeader
        tag="Vertical messaging"
        title={VERTICAL_MESSAGING_PRIMARY_HEADLINE}
        description={VERTICAL_MESSAGING_PRIMARY_SUBHEADLINE}
        centered
        className="mx-auto"
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {VERTICAL_MESSAGING_SEGMENTS.map((segment) => (
          <MarketingCard
            key={segment.id}
            href={segment.href}
            className="flex h-full flex-col gap-3 p-5 hover:border-primary/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl" aria-hidden>
                {segment.emoji}
              </span>
              <span className="rounded-full border border-border/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {segment.icpTier === "P0" ? "Pilot ICP" : "Secondary ICP"}
              </span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight">{segment.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{segment.tagline}</p>
            <span className="mt-auto text-sm font-medium text-primary">
              Explore {segment.title.toLowerCase()} →
            </span>
          </MarketingCard>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-muted-foreground">
        {VERTICAL_MESSAGING_HONESTY_NOTE} BETA and SKIPPED labels apply — no hardware lease required.
      </p>
    </section>
  );
}
