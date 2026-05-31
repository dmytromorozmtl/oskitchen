"use client";

import Link from "next/link";

import { SALES_DECK_SLIDES, type SalesDeckSlide } from "@/lib/marketing/sales-deck-slides";

function SlideBody({ slide }: { slide: SalesDeckSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center px-8 py-10 md:px-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">OS Kitchen</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{slide.title}</h2>
      {slide.subtitle ? (
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{slide.subtitle}</p>
      ) : null}
      {slide.bullets?.length ? (
        <ul className="mt-6 max-w-3xl space-y-3 text-base md:text-lg">
          {slide.bullets.map((b) => (
            <li key={b} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {slide.table ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full max-w-4xl border-collapse text-left text-sm md:text-base">
            <thead>
              <tr className="border-b">
                {slide.table.headers.map((h) => (
                  <th key={h} className="py-2 pr-4 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slide.table.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-border/60">
                  {row.map((cell) => (
                    <td key={cell} className="py-2 pr-4 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {slide.cta?.length ? (
        <div className="mt-8 flex flex-wrap gap-4 text-primary font-medium">
          {slide.cta.map((c) => (
            <Link key={c.href} href={c.href} className="underline underline-offset-4">
              {c.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SalesDeckPrint() {
  return (
    <div className="sales-deck-print bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur print:hidden">
        <p className="text-sm font-medium">Sales deck — print or Save as PDF</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Print / Save PDF
          </button>
          <Link href="/" className="rounded-md border px-4 py-2 text-sm">
            Home
          </Link>
        </div>
      </header>

      {SALES_DECK_SLIDES.map((slide, index) => (
        <section
          key={slide.id}
          className="deck-slide border-b border-dashed border-border/80 break-after-page"
          aria-label={`Slide ${index + 1}: ${slide.title}`}
        >
          <SlideBody slide={slide} />
          <footer className="px-8 pb-4 text-xs text-muted-foreground print:pb-8">
            {index + 1} / {SALES_DECK_SLIDES.length} · os-kitchen.com
          </footer>
        </section>
      ))}
    </div>
  );
}
