'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { ProductNavDropdown } from '@/components/marketing/product-nav-dropdown';
import { ResourcesNavDropdown } from '@/components/marketing/resources-nav-dropdown';
import { SiteMobileNav } from '@/components/marketing/site-mobile-nav';
import { SolutionsNavDropdown } from '@/components/marketing/solutions-nav-dropdown';
import { OSKitchenLogo } from '@/components/ui/os-kitchen-logo';
import { Button } from '@/components/ui/button';
import {
  SITE_AUTH_DASHBOARD,
  SITE_AUTH_QUICK_LINKS,
  SITE_HEADER_CTAS,
  SITE_HEADER_LINKS,
} from '@/lib/marketing/site-nav';

type SiteHeaderClientProps = {
  isAuthenticated?: boolean;
};

export function SiteHeaderClient({ isAuthenticated = false }: SiteHeaderClientProps) {
  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-border bg-white shadow-sm"
    >
      <div className="mx-auto flex h-[var(--nav-height)] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <OSKitchenLogo size="md" />

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
          {isAuthenticated ? (
            <>
              {SITE_AUTH_QUICK_LINKS.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className="hidden text-muted-foreground lg:inline-flex"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
              <Button className="hidden rounded-md md:inline-flex" asChild>
                <Link href={SITE_AUTH_DASHBOARD.href}>{SITE_AUTH_DASHBOARD.label}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link href={SITE_HEADER_CTAS.signIn.href}>{SITE_HEADER_CTAS.signIn.label}</Link>
              </Button>
              <Button className="hidden rounded-md md:inline-flex" asChild>
                <Link href={SITE_HEADER_CTAS.trial.href}>{SITE_HEADER_CTAS.trial.label}</Link>
              </Button>
            </>
          )}
          <SiteMobileNav isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </motion.header>
  );
}
