import { MarketingCard } from '@/components/marketing/card';
import { SectionHeader } from '@/components/marketing/section-header';

const SEGMENTS = [
  { icon: '🍽️', label: 'Restaurants', href: '/solutions/restaurants' },
  { icon: '🍸', label: 'Bars', href: '/solutions/bars' },
  { icon: '☕', label: 'Cafés', href: '/solutions/cafes' },
  { icon: '🥗', label: 'Meal Prep', href: '/solutions/meal-prep' },
  { icon: '👻', label: 'Ghost Kitchens', href: '/solutions/ghost-kitchens' },
  { icon: '🥐', label: 'Bakeries', href: '/solutions/bakeries' },
  { icon: '🍔', label: 'Fast-Casual', href: '/solutions/fast-casual' },
  { icon: '🍱', label: 'Catering', href: '/solutions/catering' },
] as const;

export function WhoItsFor() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          tag="Who it's for"
          title="One platform, every service model"
          description="Whether you run a dining room, a bar, a weekly meal prep menu, or five virtual brands — OS Kitchen adapts to how you serve."
          centered
          className="mx-auto"
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {SEGMENTS.map((item) => (
            <MarketingCard
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 text-center hover:border-primary/40"
            >
              <span className="text-2xl" aria-hidden>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </MarketingCard>
          ))}
        </div>
      </div>
    </section>
  );
}
