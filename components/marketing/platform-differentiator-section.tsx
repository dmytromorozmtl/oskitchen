import { MarketingCard } from "@/components/marketing/card";
import { SectionHeader } from "@/components/marketing/section-header";
import type { PlatformDifferentiatorBlock } from "@/lib/marketing/platform-differentiators-content";

type Props = {
  block: PlatformDifferentiatorBlock;
};

export function PlatformDifferentiatorSection({ block }: Props) {
  return (
    <section className="border-t border-border/60 py-16 sm:py-20">
      <SectionHeader
        tag={block.tag}
        title={block.title}
        description={block.description}
        centered
        className="mx-auto"
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {block.items.map((item) => (
          <MarketingCard key={item.title} className="h-full">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              {item.badge ? (
                <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </MarketingCard>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted-foreground">{block.footnote}</p>
    </section>
  );
}
