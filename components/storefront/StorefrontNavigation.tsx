"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import type { ValidatedNavLink } from "@/lib/storefront/navigation-validation";
import { navIconGlyph } from "@/lib/storefront-builder/nav-icons";
import { NavDropdown } from "@/components/storefront/nav-dropdown";

function NavLinkItem({
  link,
  mobile = false,
  onNavigate,
}: {
  link: ValidatedNavLink;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const glyph = navIconGlyph(link.icon);
  const label = glyph ? (
    <>
      <span aria-hidden className="mr-0.5">
        {glyph}
      </span>
      {link.label}
    </>
  ) : (
    link.label
  );

  if (!link.href) return null;

  const className = mobile
    ? "block rounded-xl px-4 py-3 text-base font-medium text-foreground/90 hover:bg-muted dark:hover:bg-gray-800"
    : "rounded-full px-3 py-1.5 text-foreground/90 transition hover:bg-muted dark:hover:bg-gray-800";

  if (link.external) {
    return (
      <a
        href={link.href}
        className={className}
        rel={link.newTab ? "noopener noreferrer" : "noopener noreferrer"}
        target={link.newTab ? "_blank" : undefined}
        onClick={onNavigate}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {label}
    </Link>
  );
}

export function StorefrontNavigation({
  storeSlug,
  publicName,
  tagline,
  logoUrl,
  accentColor,
  links,
  localeSwitcher,
  trailing,
  sticky = true,
}: {
  storeSlug: string;
  publicName: string;
  tagline?: string | null;
  logoUrl: string | null;
  accentColor: string;
  links: ValidatedNavLink[];
  localeSwitcher?: ReactNode;
  trailing?: ReactNode;
  sticky?: boolean;
}) {
  const base = `/s/${storeSlug}`;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header
      className={`${sticky ? "sticky top-0" : ""} z-40 border-b border-border/80 bg-card/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/90`}
    >
      <div className="sf-container flex items-center justify-between gap-3 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link href={base} className="flex min-w-0 items-center gap-3" onClick={closeMobile}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-border"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #1e4f8c)` }}
              >
                {publicName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="truncate font-semibold tracking-tight">{publicName}</p>
              <p className="truncate text-xs text-muted-foreground">{tagline?.trim() || "Preorder & catering"}</p>
            </div>
          </Link>
        </div>

        <nav className="hidden flex-wrap items-center gap-1 text-sm font-medium md:flex" aria-label="Primary">
          {localeSwitcher}
          {links.map((l) =>
            l.children && l.children.length > 0 ? (
              <NavDropdown key={l.id} link={l} />
            ) : (
              <NavLinkItem key={l.id} link={l} />
            ),
          )}
          {trailing}
        </nav>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex shrink-0 items-center justify-center rounded-full p-2 hover:bg-muted md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-border/80 bg-card dark:border-gray-800 dark:bg-gray-950 md:hidden">
          <nav className="sf-container flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {localeSwitcher ? <div className="mb-2">{localeSwitcher}</div> : null}
            {links.map((l) =>
              l.children && l.children.length > 0 ? (
                <div key={l.id} className="flex flex-col gap-1">
                  <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {l.label}
                  </span>
                  {l.children.map((c) =>
                    c.href ? (
                      c.external ? (
                        <a
                          key={c.id}
                          href={c.href}
                          className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted"
                          rel="noopener noreferrer"
                          target={c.newTab ? "_blank" : undefined}
                          onClick={closeMobile}
                        >
                          {c.label}
                        </a>
                      ) : (
                        <Link
                          key={c.id}
                          href={c.href}
                          className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted"
                          onClick={closeMobile}
                        >
                          {c.label}
                        </Link>
                      )
                    ) : null,
                  )}
                </div>
              ) : (
                <NavLinkItem key={l.id} link={l} mobile onNavigate={closeMobile} />
              ),
            )}
            {trailing ? <div className="mt-2 border-t border-border/60 pt-3">{trailing}</div> : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
