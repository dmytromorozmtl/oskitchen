"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { SliderSectionContent } from "@/lib/storefront/section-schemas/slider";

export function SliderSection({
  content,
  storeSlug,
  sectionId,
}: {
  content: SliderSectionContent;
  storeSlug: string;
  sectionId: string;
}) {
  const base = `/s/${storeSlug}`;
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const reduceMotion = React.useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const slides = content.slides;
  const autoplayAllowed = content.autoplay && !reduceMotion;
  const interval = Math.min(Math.max(content.intervalMs, 3000), 12000);

  React.useEffect(() => {
    if (!autoplayAllowed || paused || slides.length < 2) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, interval);
    return () => window.clearInterval(t);
  }, [autoplayAllowed, paused, slides.length, interval]);

  const s = slides[index] ?? slides[0];
  if (!s) return null;

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  const href = (s.ctaHref ?? "").trim();
  const resolvedHref =
    href.startsWith("http://") || href.startsWith("https://")
      ? href
      : href && !href.startsWith("javascript:") && !href.startsWith("data:")
        ? href.startsWith("/")
          ? href.startsWith("/s/")
            ? href
            : `${base}${href.startsWith("/") ? "" : "/"}${href.replace(/^\//, "")}`
          : `${base}/${href.replace(/^\//, "")}`
        : null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted/20"
      aria-roledescription="carousel"
      aria-label="Promotional slider"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        }
      }}
      onMouseEnter={() => (content.pauseOnHover ? setPaused(true) : null)}
      onMouseLeave={() => (content.pauseOnHover ? setPaused(false) : null)}
    >
      <div className="px-6 py-10 text-center" style={{ textAlign: s.alignment }}>
        <h2 className="text-2xl font-semibold tracking-tight">{s.title}</h2>
        {s.subtitle ? <p className="mt-2 text-muted-foreground">{s.subtitle}</p> : null}
        {s.imageUrl ? (
          <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-xl border border-border/60 bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={(s.altText ?? "").trim() || s.title}
              className="max-h-[420px] w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}
        {resolvedHref && (s.ctaLabel ?? "").trim() ? (
          <div className="mt-6">
            <Button asChild className="rounded-full">
              <Link href={resolvedHref}>{s.ctaLabel!.trim()}</Link>
            </Button>
          </div>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-card/40 px-3 py-2">
          {content.showArrows ? (
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => go(-1)} aria-label="Previous slide">
              Prev
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
            {autoplayAllowed ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setPaused((p) => !p)} aria-pressed={paused} className="rounded-full">
                {paused ? "Play" : "Pause"}
              </Button>
            ) : null}
            {content.showDots ? (
              <div className="flex flex-wrap justify-center gap-1" role="tablist" aria-label="Slides">
                {slides.map((_, i) => (
                  <button
                    key={`${sectionId}-dot-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-primary" : "bg-muted-foreground/30"}`}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
            ) : null}
          </div>
          {content.showArrows ? (
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => go(1)} aria-label="Next slide">
              Next
            </Button>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </section>
  );
}
