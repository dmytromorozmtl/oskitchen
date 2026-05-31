import { Unlock } from 'lucide-react';

import { cn } from '@/lib/utils';

/** Label for the no-lock-in trust badge — exported for tests and sales copy. */
export const NO_LOCK_IN_BADGE_LABEL = 'No Hardware Lock-In' as const;

/** Hero subheading for hardware-flexibility positioning. */
export const NO_LOCK_IN_HERO_SUBHEADING = 'Works with your equipment' as const;

type NoLockInBadgeProps = {
  className?: string;
  size?: 'sm' | 'md';
};

export function NoLockInBadge({ className, size = 'md' }: NoLockInBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 font-semibold text-primary',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs uppercase tracking-widest',
        className,
      )}
    >
      <Unlock className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden />
      {NO_LOCK_IN_BADGE_LABEL}
    </span>
  );
}

type NoLockInHeroSubheadingProps = {
  className?: string;
};

export function NoLockInHeroSubheading({ className }: NoLockInHeroSubheadingProps) {
  return (
    <p
      className={cn(
        'text-lg leading-relaxed text-muted-foreground sm:text-xl',
        className,
      )}
    >
      {NO_LOCK_IN_HERO_SUBHEADING}. Bring your tablet, printer, and optional card reader — no
      proprietary terminal contract.
    </p>
  );
}
