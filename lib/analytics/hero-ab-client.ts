'use client';

import {
  HERO_AB_COOKIE,
  HERO_AB_QUERY_KEY,
  HERO_AB_VARIANTS,
  type HeroVariantId,
} from '@/lib/marketing/hero-ab-variants';

import { trackGtagEvent } from './gtag-events';

const VALID: HeroVariantId[] = ['a', 'b'];

function isValidVariant(value: string | null | undefined): value is HeroVariantId {
  return value === 'a' || value === 'b';
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function assignRandomVariant(): HeroVariantId {
  return Math.random() < 0.5 ? 'a' : 'b';
}

/** Resolve variant from ?h= query, cookie, or new random assignment. */
export function resolveHeroVariant(): HeroVariantId {
  if (typeof window === 'undefined') return 'a';

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get(HERO_AB_QUERY_KEY);
  if (isValidVariant(fromQuery)) {
    writeCookie(HERO_AB_COOKIE, fromQuery);
    return fromQuery;
  }

  const fromCookie = readCookie(HERO_AB_COOKIE);
  if (isValidVariant(fromCookie)) return fromCookie;

  const assigned = assignRandomVariant();
  writeCookie(HERO_AB_COOKIE, assigned);
  return assigned;
}

export function trackHeroAbView(variant: HeroVariantId) {
  trackGtagEvent('hero_ab_view', {
    hero_variant: variant,
    experiment: 'homepage_hero_may2026',
  });
}

export function trackHeroAbCta(variant: HeroVariantId, cta: 'primary' | 'secondary' | 'video') {
  trackGtagEvent('hero_ab_cta', {
    hero_variant: variant,
    cta,
    experiment: 'homepage_hero_may2026',
  });
}

export function getHeroCopy(variant: HeroVariantId) {
  return HERO_AB_VARIANTS[variant];
}
