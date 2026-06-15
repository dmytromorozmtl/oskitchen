'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeader } from '@/components/marketing/section-header';
import type { FaqItem } from '@/lib/marketing/solution-page-faq';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';

type Props = {
  faq: FaqItem[];
  meta: SolutionSegmentMeta;
};

export function SolutionFaqSection({ faq, meta }: Props) {
  return (
    <section className="border-t border-border/60 py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeader
          tag={meta.faqTag}
          title={meta.faqTitle}
          description={meta.faqDescription}
        />

        <Accordion type="single" collapsible className="w-full">
          {faq.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="border-border/80"
            >
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
