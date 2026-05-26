"use client";

import * as React from "react";
import Link from "next/link";

import type { ValidatedNavLink } from "@/lib/storefront/navigation-validation";
import { navIconGlyph } from "@/lib/storefront-builder/nav-icons";

export function NavDropdown({ link }: { link: ValidatedNavLink }) {
  const [open, setOpen] = React.useState(false);
  const children = link.children ?? [];
  const glyph = navIconGlyph(link.icon);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-1 rounded-full px-3 py-1 hover:bg-muted"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {glyph ? <span aria-hidden>{glyph}</span> : null}
        {link.label}
        <span className="text-[10px] opacity-60">▾</span>
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-xl border border-border/80 bg-card py-1 shadow-lg">
          {children.map((c) =>
            c.external ? (
              <a
                key={c.id}
                href={c.href ?? "#"}
                className="block px-3 py-2 text-sm hover:bg-muted"
                rel="noopener noreferrer"
                target={c.newTab ? "_blank" : undefined}
                onClick={() => setOpen(false)}
              >
                {navIconGlyph(c.icon) ? `${navIconGlyph(c.icon)} ` : ""}
                {c.label}
              </a>
            ) : (
              <Link
                key={c.id}
                href={c.href ?? "#"}
                className="block px-3 py-2 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {navIconGlyph(c.icon) ? `${navIconGlyph(c.icon)} ` : ""}
                {c.label}
              </Link>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
