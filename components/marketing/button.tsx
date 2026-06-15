import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface MarketingButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function MarketingButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  type = 'button',
}: MarketingButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200';
  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25',
    secondary: 'border border-border bg-background text-foreground hover:bg-muted',
    ghost: 'text-foreground hover:bg-muted',
  };
  const sizes = {
    sm: 'text-sm px-4 py-2 rounded-full',
    md: 'text-sm px-6 py-3 rounded-full',
    lg: 'text-base px-8 py-3.5 rounded-full',
  };
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
