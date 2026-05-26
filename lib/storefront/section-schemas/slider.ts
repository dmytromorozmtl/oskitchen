import { z } from "zod";

import { assertSafeHttpsUrl } from "@/lib/storefront-builder/safe-content";

const alignment = z.enum(["left", "center", "right"]);

  const slideSchema = z
  .object({
    title: z.string().min(1).max(200),
    subtitle: z.string().max(400).optional().or(z.literal("")),
    imageAssetId: z.union([z.string().uuid(), z.literal("")]).optional(),
    imageUrl: z.string().max(2000).optional().or(z.literal("")),
    altText: z.string().max(500).optional().or(z.literal("")),
    ctaLabel: z.string().max(120).optional().or(z.literal("")),
    ctaHref: z.string().max(2000).optional().or(z.literal("")),
    alignment: alignment.default("center"),
  })
  .superRefine((val, ctx) => {
    const hasImg = Boolean(
      (val.imageAssetId && /^[0-9a-f-]{36}$/i.test(val.imageAssetId)) || (val.imageUrl && val.imageUrl.trim().length > 0),
    );
    if (hasImg) {
      const alt = (val.altText ?? "").trim();
      if (!alt) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Alt text is required when an image is set.", path: ["altText"] });
      }
    }
    const imgUrl = (val.imageUrl ?? "").trim();
    if (imgUrl) {
      const ok = assertSafeHttpsUrl(imgUrl, { allowHttpLocal: process.env.NODE_ENV !== "production" });
      if (!ok.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: ok.reason, path: ["imageUrl"] });
    }
    const href = (val.ctaHref ?? "").trim();
    if (href) {
      if (href.startsWith("http://") || href.startsWith("https://")) {
        const ok = assertSafeHttpsUrl(href, { allowHttpLocal: process.env.NODE_ENV !== "production" });
        if (!ok.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: ok.reason, path: ["ctaHref"] });
      } else if (href.startsWith("javascript:") || href.startsWith("data:")) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Unsafe URL", path: ["ctaHref"] });
      }
    }
  });

export const sliderSectionSchema = z.object({
  slides: z.array(slideSchema).min(1).max(8),
  autoplay: z.boolean().optional().default(false),
  intervalMs: z.coerce.number().min(3000).max(12000).default(5000),
  showDots: z.boolean().optional().default(true),
  showArrows: z.boolean().optional().default(true),
  pauseOnHover: z.boolean().optional().default(true),
});

export type SliderSectionContent = z.infer<typeof sliderSectionSchema>;
