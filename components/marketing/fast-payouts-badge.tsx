import { Banknote } from 'lucide-react';

import { cn } from '@/lib/utils';

/** Label for the fast-payouts trust badge — exported for tests and sales copy. */
export const FAST_PAYOUTS_BADGE_LABEL = 'Next-Day Payouts' as const;

/** Short qualifier shown with the badge — Stripe standard schedule, not OS Kitchen custody. */
export const FAST_PAYOUTS_BADGE_DETAIL =
  'Stripe standard schedule — OS Kitchen never holds your funds' as const;

type FastPayoutsBadgeProps = {
  className?: string;
  size?: 'sm' | 'md';
  showDetail?: boolean;
};

export function FastPayoutsBadge({
  className,
  size = 'md',
  showDetail = false,
}: FastPayoutsBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex flex-col items-start gap-0.5',
        showDetail && 'rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/5 font-semibold text-emerald-700 dark:text-emerald-400',
          size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs uppercase tracking-widest',
        )}
      >
        <Banknote
          className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
          aria-hidden
        />
        {FAST_PAYOUTS_BADGE_LABEL}
      </span>
      {showDetail ? (
        <span className="text-xs text-muted-foreground">{FAST_PAYOUTS_BADGE_DETAIL}</span>
      ) : null}
    </span>
  );
}
