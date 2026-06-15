'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeader } from '@/components/marketing/section-header';

type Faq = { q: string; a: string };

type Props = {
  faqs: Faq[];
  tag?: string;
  title?: string;
};

export function CompareFaqSection({
  faqs,
  tag = 'FAQ',
  title = 'Common questions',
}: Props) {
  return (
    <section className="border-t border-border/60 py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeader tag={tag} title={title} description="Answers for finance, ops, and IT reviewers." />
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">{item.q}</AccordionTrigger>
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
