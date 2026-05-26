'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { ProductNavDropdown } from '@/components/marketing/product-nav-dropdown';
import { ResourcesNavDropdown } from '@/components/marketing/resources-nav-dropdown';
import { SiteMobileNav } from '@/components/marketing/site-mobile-nav';
import { SolutionsNavDropdown } from '@/components/marketing/solutions-nav-dropdown';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';
import { SITE_HEADER_CTAS, SITE_HEADER_LINKS } from '@/lib/marketing/site-nav';

export function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-xs font-bold text-white shadow-sm">
            K
          </span>
          <span className="truncate">{APP_NAME}</span>
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm text-muted-foreground md:flex"
          aria-label="Main"
        >
          <SolutionsNavDropdown />
          <ProductNavDropdown />
          {SITE_HEADER_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <ResourcesNavDropdown />
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link href={SITE_HEADER_CTAS.signIn.href}>{SITE_HEADER_CTAS.signIn.label}</Link>
          </Button>
          <Button className="hidden rounded-full shadow-sm md:inline-flex" variant="premium" asChild>
            <Link href={SITE_HEADER_CTAS.trial.href}>{SITE_HEADER_CTAS.trial.label}</Link>
          </Button>
          <SiteMobileNav />
        </div>
      </div>
    </motion.header>
  );
}
