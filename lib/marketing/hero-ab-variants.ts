/** Homepage hero A/B variants — wire to GA4 custom dimension `hero_variant`. */

export type HeroVariantId = 'a' | 'b';

export type HeroVariantCopy = {
  id: HeroVariantId;
  badge: string;
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  trustLine: string;
  proofPoints: readonly string[];
};

const SHARED = {
  badge: 'The operations OS for meal prep, restaurants & ghost kitchens',
  primaryCta: { label: 'Start free trial', href: '/signup' },
  secondaryCta: { label: 'See product tour', href: '/demo' },
  trustLine: '14-day trial · No credit card · Cancel anytime',
  proofPoints: [
    'Counter and table POS on tablets you already own',
    'Kitchen display with live ticket routing',
    'Production, pickup, and dispatch in one workspace',
  ],
} as const;

/** Control — outcome-led positioning (baseline). */
export const HERO_VARIANT_A: HeroVariantCopy = {
  id: 'a',
  ...SHARED,
  headline: 'FOH, BOH, and storefront in one system — no hardware lease',
  subheadline:
    'The only platform that unifies counter POS, kitchen display, production, packing, and online preorders on tablets you already own — built for meal prep, ghost kitchens, and full-service operators.',
};

/** Variant B — cost and hardware objection lead. */
export const HERO_VARIANT_B: HeroVariantCopy = {
  id: 'b',
  ...SHARED,
  headline: 'Restaurant POS and kitchen software — without the hardware lease',
  subheadline:
    'Replace locked-in terminals and paper tickets with one web-based workspace. Tables, KDS, QR ordering, and production planning on iPad, Android, or desktop.',
};

export const HERO_AB_VARIANTS: Record<HeroVariantId, HeroVariantCopy> = {
  a: HERO_VARIANT_A,
  b: HERO_VARIANT_B,
};

export const HERO_AB_COOKIE = 'kos_hero_ab';
export const HERO_AB_QUERY_KEY = 'h';
