import { StorefrontSectionType } from "@prisma/client";
import { defaultSectionContent } from "@/lib/storefront/sections";

export type SectionPackId = "hero_cta" | "announcement_faq";

export type SectionPackDefinition = {
  id: SectionPackId;
  name: string;
  description: string;
  sections: { type: StorefrontSectionType; content?: Record<string, unknown> }[];
};

export const STOREFRONT_SECTION_PACKS: SectionPackDefinition[] = [
  {
    id: "hero_cta",
    name: "Hero + CTA",
    description: "Welcome hero with primary call-to-action block.",
    sections: [
      { type: StorefrontSectionType.HERO },
      {
        type: StorefrontSectionType.CTA,
        content: {
          headline: "Ready to order?",
          body: "Browse the menu and secure your pickup or delivery slot.",
          buttonLabel: "View menu",
          buttonHref: "/menu",
        },
      },
    ],
  },
  {
    id: "announcement_faq",
    name: "Announcement + FAQ",
    description: "Top banner plus two starter questions.",
    sections: [
      { type: StorefrontSectionType.ANNOUNCEMENT },
      { type: StorefrontSectionType.FAQ },
    ],
  },
];

export function resolveSectionPack(id: string): SectionPackDefinition | null {
  return STOREFRONT_SECTION_PACKS.find((p) => p.id === id) ?? null;
}

export function sectionPackToCreatePayload(pack: SectionPackDefinition) {
  return pack.sections.map((s) => ({
    type: s.type,
    contentJson: { ...defaultSectionContent(s.type), ...s.content },
  }));
}
