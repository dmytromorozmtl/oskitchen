import type { StorefrontSectionType } from "@prisma/client";
import { toJsonValue } from "@/lib/prisma/json";
import { z } from "zod";

import { resolveSectionContentForLocale } from "@/lib/storefront/localized-content";
import {
  cateringSectionSchema,
  contactFormSectionSchema,
  featuredMenuSectionSchema,
  gallerySectionSchema,
  imageTextSectionSchema,
  reviewsSectionSchema,
  testimonialsSectionSchema,
} from "@/lib/storefront/section-schemas/builder-sections";
import { sliderSectionSchema } from "@/lib/storefront/section-schemas/slider";

/** Minimal JSON shapes for section content — extend as builder grows. */
export const heroSectionSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  primaryCtaLabel: z.string().optional(),
  primaryCtaHref: z.string().optional(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaHref: z.string().optional(),
});

export const textBlockSchema = z.object({
  heading: z.string().optional(),
  body: z.string(),
  bodyFormat: z.enum(["plain", "markdown"]).optional(),
});

export const ctaSectionSchema = z.object({
  headline: z.string().optional(),
  body: z.string().optional(),
  buttonLabel: z.string().optional(),
  buttonHref: z.string().optional(),
});

export const announcementSectionSchema = z.object({
  message: z.string(),
  tone: z.enum(["info", "warning", "success"]).optional(),
});

export const faqSectionSchema = z.object({
  items: z.array(z.object({ q: z.string(), a: z.string() })),
});

export function schemaForSectionType(type: StorefrontSectionType): z.ZodType<unknown> {
  switch (type) {
    case "HERO":
      return heroSectionSchema;
    case "TEXT_BLOCK":
      return textBlockSchema;
    case "CTA":
      return ctaSectionSchema;
    case "ANNOUNCEMENT":
      return announcementSectionSchema;
    case "FAQ":
      return faqSectionSchema;
    case "SLIDER":
      return sliderSectionSchema;
    case "FEATURED_MENU":
      return featuredMenuSectionSchema;
    case "IMAGE_TEXT":
      return imageTextSectionSchema;
    case "TESTIMONIALS":
      return testimonialsSectionSchema;
    case "CONTACT_FORM":
      return contactFormSectionSchema;
    case "GALLERY":
      return gallerySectionSchema;
    case "CATERING":
      return cateringSectionSchema;
    case "REVIEWS":
      return reviewsSectionSchema;
  }
}

export function parseSectionContent<T>(schema: z.ZodType<T>, raw: unknown): T | null {
  const r = schema.safeParse(raw);
  return r.success ? r.data : null;
}

/** Parse section content for a guest locale (supports localized wrapper). */
export function parseSectionContentForLocale<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  locale: string,
  fallbackLocale = "en",
): T | null {
  const flat = resolveSectionContentForLocale(raw, locale, fallbackLocale);
  return parseSectionContent(schema, flat);
}

/** Validates `contentJson` for a section type; returns normalized object or null. */
export function normalizeSectionContent(type: StorefrontSectionType, raw: unknown): Record<string, unknown> | null {
  const flat = resolveSectionContentForLocale(raw, "en");
  const r = schemaForSectionType(type).safeParse(flat);
  return r.success ? (r.data as Record<string, unknown>) : null;
}

/** Validates localized or flat payload for a specific locale slice. */
export function normalizeSectionContentForLocale(
  type: StorefrontSectionType,
  raw: unknown,
  locale: string,
  fallbackLocale = "en",
): Record<string, unknown> | null {
  const flat = resolveSectionContentForLocale(raw, locale, fallbackLocale);
  const r = schemaForSectionType(type).safeParse(flat);
  return r.success ? (r.data as Record<string, unknown>) : null;
}

export function defaultSectionContent(type: StorefrontSectionType): Record<string, unknown> {
  switch (type) {
    case "HERO":
      return {
        headline: "Welcome",
        subheadline: "Tell guests what you offer.",
        imageUrl: "",
        imageAlt: "",
        primaryCtaLabel: "View menu",
        primaryCtaHref: "/",
        secondaryCtaLabel: "",
        secondaryCtaHref: "",
      };
    case "TEXT_BLOCK":
      return { heading: "Details", body: "Add your story, hours, or policies here.", bodyFormat: "plain" };
    case "CTA":
      return {
        headline: "Ready to order?",
        body: "Secure your pickup or delivery slot.",
        buttonLabel: "Start order",
        buttonHref: "/",
      };
    case "ANNOUNCEMENT":
      return { message: "We are open for preorders this week.", tone: "info" };
    case "FEATURED_MENU":
      return { heading: "This week", subheading: "Highlights from your active menu." };
    case "FAQ":
      return {
        items: [
          { q: "When do you deliver?", a: "Add your answer here." },
          { q: "How do I change my order?", a: "Add your answer here." },
        ],
      };
    case "IMAGE_TEXT":
      return { heading: "Image + text", body: "Describe this photo.", imageUrl: "", imageAlt: "" };
    case "CONTACT_FORM":
      return { heading: "Contact us", body: "We usually reply within one business day." };
    case "GALLERY":
      return { images: [] as { url: string; alt?: string }[] };
    case "TESTIMONIALS":
      return {
        heading: "What guests say",
        items: [{ quote: "Amazing food every week.", author: "Happy customer", role: "" }],
      };
    case "CATERING":
      return { heading: "Catering", body: "Tell planners how to reach you." };
    case "REVIEWS":
      return { heading: "Reviews", embedNote: "Connect a reviews provider in a future release." };
    case "SLIDER":
      return {
        slides: [
          {
            title: "Slide one",
            subtitle: "Add a subtitle",
            imageUrl: "",
            altText: "",
            ctaLabel: "View menu",
            ctaHref: "/menu",
            alignment: "center",
          },
        ],
        autoplay: false,
        intervalMs: 5000,
        showDots: true,
        showArrows: true,
        pauseOnHover: true,
      };
    default:
      return {};
  }
}
