import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface MarketingCardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  hover?: boolean;
}

export function MarketingCard({
  children,
  className,
  href,
  hover = true,
}: MarketingCardProps) {
  const classes = cn(
    'rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300',
    hover && 'hover:-translate-y-0.5 hover:shadow-card-hover',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(classes, 'block')}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}
