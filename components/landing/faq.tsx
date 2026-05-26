'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeader } from '@/components/marketing/section-header';
import { LANDING_FAQS } from '@/lib/marketing/landing-faq';

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeader
          tag="FAQ"
          title="Answers before you commit to a pilot"
          description="Straight talk on POS scope, hardware, trials, and integrations — so you can evaluate KitchenOS with realistic expectations."
        />

        <Accordion type="single" collapsible className="w-full">
          {LANDING_FAQS.map((item, idx) => (
            <AccordionItem key={item.q} value={`item-${idx}`} className="border-border/80">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
