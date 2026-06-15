import { StorefrontPageType, StorefrontSectionType } from "@prisma/client";
import { defaultSectionContent } from "@/lib/storefront/sections";

export type PageSectionTemplate = {
  sections: { type: StorefrontSectionType; content?: Record<string, unknown> }[];
  defaultSlug?: string;
  robotsNoindex?: boolean;
};

export function pageSectionTemplateForType(pageType: StorefrontPageType): PageSectionTemplate {
  switch (pageType) {
    case StorefrontPageType.CATERING:
      return {
        defaultSlug: "catering",
        sections: [
          {
            type: StorefrontSectionType.HERO,
            content: {
              headline: "Catering & events",
              subheadline: "Tell us about your date, headcount, and dietary needs.",
              primaryCtaLabel: "Request a quote",
              primaryCtaHref: "#contact",
            },
          },
          {
            type: StorefrontSectionType.TEXT_BLOCK,
            content: {
              heading: "What we offer",
              body: "Add packages, minimums, and lead times here.\n\n- Drop-off trays\n- On-site service\n- Dietary accommodations",
              bodyFormat: "markdown",
            },
          },
          {
            type: StorefrontSectionType.CTA,
            content: {
              headline: "Ready to plan your event?",
              body: "We typically reply within one business day.",
              buttonLabel: "Contact us",
              buttonHref: "/contact",
            },
          },
        ],
      };
    case StorefrontPageType.THANK_YOU:
      return {
        defaultSlug: "thank-you",
        robotsNoindex: true,
        sections: [
          {
            type: StorefrontSectionType.HERO,
            content: {
              headline: "Thank you",
              subheadline: "Your request was received. We'll confirm details by email shortly.",
              primaryCtaLabel: "Back to menu",
              primaryCtaHref: "/menu",
            },
          },
          {
            type: StorefrontSectionType.TEXT_BLOCK,
            content: {
              heading: "What's next?",
              body: "Check your inbox for a confirmation. If you don't see it, check spam or contact us directly.",
            },
          },
        ],
      };
    case StorefrontPageType.FAQ:
      return {
        defaultSlug: "faq",
        sections: [{ type: StorefrontSectionType.FAQ }],
      };
    case StorefrontPageType.CONTACT:
      return {
        defaultSlug: "contact",
        sections: [
          {
            type: StorefrontSectionType.HERO,
            content: {
              headline: "Contact us",
              subheadline: "Questions about orders, catering, or allergens?",
            },
          },
          {
            type: StorefrontSectionType.TEXT_BLOCK,
            content: {
              body: "Use the form below or email us during business hours.",
            },
          },
        ],
      };
    default:
      return {
        sections: [
          { type: StorefrontSectionType.HERO },
          { type: StorefrontSectionType.TEXT_BLOCK },
        ],
      };
  }
}

export function buildSectionsCreateInput(pageType: StorefrontPageType) {
  const tpl = pageSectionTemplateForType(pageType);
  return tpl.sections.map((s, sortOrder) => ({
    type: s.type,
    sortOrder,
    contentJson: { ...defaultSectionContent(s.type), ...s.content },
  }));
}
