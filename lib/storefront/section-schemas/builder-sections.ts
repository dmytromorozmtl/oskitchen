import { z } from "zod";

const optionalUrl = z.string().max(2000).optional().or(z.literal(""));
const optionalUuid = z.union([z.string().uuid(), z.literal("")]).optional();

export const featuredMenuSectionSchema = z.object({
  heading: z.string().max(200).optional(),
  subheading: z.string().max(400).optional(),
  menuId: optionalUuid,
  ctaLabel: z.string().max(120).optional(),
  ctaHref: optionalUrl,
});

export const imageTextSectionSchema = z.object({
  heading: z.string().max(200).optional(),
  body: z.string().max(20_000),
  imageUrl: optionalUrl,
  imageAlt: z.string().max(500).optional(),
  imagePosition: z.enum(["left", "right"]).optional(),
});

export const testimonialsSectionSchema = z.object({
  heading: z.string().max(200).optional(),
  items: z
    .array(
      z.object({
        quote: z.string().min(1).max(2000),
        author: z.string().max(200).optional(),
        role: z.string().max(200).optional(),
      }),
    )
    .min(1)
    .max(24),
});

export const contactFormSectionSchema = z.object({
  heading: z.string().max(200).optional(),
  body: z.string().max(4000).optional(),
  formId: optionalUuid,
});

export const gallerySectionSchema = z.object({
  heading: z.string().max(200).optional(),
  images: z
    .array(
      z.object({
        imageUrl: z.string().min(1).max(2000),
        altText: z.string().min(1).max(500),
        caption: z.string().max(400).optional(),
      }),
    )
    .min(1)
    .max(24),
});

export const cateringSectionSchema = z.object({
  heading: z.string().max(200).optional(),
  body: z.string().max(20_000),
  ctaLabel: z.string().max(120).optional(),
  ctaHref: optionalUrl,
});

export const reviewsSectionSchema = z.object({
  heading: z.string().max(200).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxItems: z.coerce.number().min(1).max(24).optional(),
});
