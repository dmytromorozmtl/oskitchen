import { ArrowRight } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';

type Props = {
  title: string;
  subtitle: string;
  signupHref?: string;
  bookDemoHref?: string;
};

export function SolutionFinalCta({
  title,
  subtitle,
  signupHref = '/signup',
  bookDemoHref = '/book-demo',
}: Props) {
  return (
    <section className="pb-20 pt-4 sm:pb-28">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-6 py-14 text-center shadow-elevated sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_50%)]"
        />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-100">{subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <MarketingButton
              href={signupHref}
              size="lg"
              className="bg-white text-primary-700 shadow-lg hover:bg-white/95 hover:text-primary-800"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MarketingButton>
            <MarketingButton
              href={bookDemoHref}
              variant="secondary"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              Book a demo
            </MarketingButton>
          </div>
        </div>
      </div>
    </section>
  );
}
