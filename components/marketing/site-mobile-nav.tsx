'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { APP_NAME } from '@/lib/constants';
import {
  SITE_HEADER_CTAS,
  SITE_MOBILE_QUICK_LINKS,
  SITE_PRODUCT_NAV,
  SITE_RESOURCES_NAV,
} from '@/lib/marketing/site-nav';
import { SOLUTIONS_HUB_PRIMARY } from '@/lib/marketing/solutions-hub-content';
import { cn } from '@/lib/utils';

function MobileNavLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        {children}
      </Link>
    </SheetClose>
  );
}

export function SiteMobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(100vw-1.5rem,22rem)] flex-col gap-0 p-0 sm:max-w-sm"
      >
        <SheetHeader className="space-y-1 border-b border-border/60 px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold tracking-tight">{APP_NAME}</SheetTitle>
          <p className="text-xs text-muted-foreground">POS &amp; kitchen operations</p>
        </SheetHeader>

        <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-4" aria-label="Mobile">
          <div className="grid grid-cols-2 gap-2">
            {SITE_MOBILE_QUICK_LINKS.map((item) => (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className="rounded-xl border border-border/80 bg-muted/40 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-muted"
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{item.hint}</span>
                </Link>
              </SheetClose>
            ))}
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="solutions"
            className="mt-4 rounded-xl border border-border/80 bg-card/50 px-1"
          >
            <AccordionItem value="solutions" className="border-border/60 px-2">
              <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
                Solutions
              </AccordionTrigger>
              <AccordionContent className="pb-2 pt-0">
                <ul className="space-y-0.5">
                  {SOLUTIONS_HUB_PRIMARY.map((item) => (
                    <li key={item.slug}>
                      <MobileNavLink href={item.href} className="flex gap-3 py-2">
                        <span className="text-lg leading-none" aria-hidden>
                          {item.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-foreground">{item.title}</span>
                          <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </MobileNavLink>
                    </li>
                  ))}
                  <li className="border-t border-border/60 pt-1">
                    <MobileNavLink href="/solutions" className="font-medium text-primary">
                      View all solutions
                    </MobileNavLink>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="product" className="border-border/60 px-2">
              <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
                Product
              </AccordionTrigger>
              <AccordionContent className="pb-2 pt-0">
                <ul className="space-y-0.5">
                  {SITE_PRODUCT_NAV.map((item) => (
                    <li key={item.href}>
                      <MobileNavLink href={item.href}>{item.label}</MobileNavLink>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="resources" className="border-0 px-2">
              <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
                Resources
              </AccordionTrigger>
              <AccordionContent className="pb-2 pt-0">
                <ul className="space-y-0.5">
                  {SITE_RESOURCES_NAV.map((item) => (
                    <li key={item.href}>
                      <MobileNavLink
                        href={item.href}
                        className={item.href === '/book-demo' ? 'font-medium text-primary' : undefined}
                      >
                        {item.label}
                      </MobileNavLink>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </nav>

        <div className="space-y-2 border-t border-border/60 bg-muted/20 px-5 py-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full rounded-full" asChild>
              <Link href={SITE_HEADER_CTAS.signIn.href}>{SITE_HEADER_CTAS.signIn.label}</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="premium" className="w-full rounded-full shadow-sm" asChild>
              <Link href={SITE_HEADER_CTAS.trial.href}>{SITE_HEADER_CTAS.trial.label}</Link>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
