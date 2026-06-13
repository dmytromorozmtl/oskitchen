export const VERTICAL_MESSAGING_PRIMARY_HEADLINE =
  "Built for multi-concept operators" as const;

export const VERTICAL_MESSAGING_PRIMARY_SUBHEADLINE =
  "Run ghost kitchens, meal prep, commissary production, and catering events from one honest ops layer — without Toast/Square hardware lock-in or fake integration badges." as const;

export type VerticalMessagingSegmentId =
  | "multi-concept"
  | "ghost-kitchen"
  | "meal-prep"
  | "commissary"
  | "catering";

export type VerticalMessagingSegment = {
  id: VerticalMessagingSegmentId;
  emoji: string;
  title: string;
  tagline: string;
  href: string;
  icpTier: "P0" | "secondary";
};

export const VERTICAL_MESSAGING_SEGMENTS: VerticalMessagingSegment[] = [
  {
    id: "multi-concept",
    emoji: "🏢",
    title: "Multi-concept operators",
    tagline:
      "Switch brands, locations, and production lanes without spreadsheet chaos — one command center for ≤5 locations in pilot scope.",
    href: "/ghost-kitchen-software",
    icpTier: "P0",
  },
  {
    id: "ghost-kitchen",
    emoji: "👻",
    title: "Ghost kitchens",
    tagline: "Multi-brand order hub, channel imports, and KDS routing with honest BETA labels.",
    href: "/ghost-kitchen-software",
    icpTier: "P0",
  },
  {
    id: "meal-prep",
    emoji: "🥗",
    title: "Meal prep",
    tagline: "Weekly menus, preorder cutoffs, production waves, and packing — software-first.",
    href: "/meal-prep-software",
    icpTier: "P0",
  },
  {
    id: "commissary",
    emoji: "🏭",
    title: "Commissary & shared kitchen",
    tagline: "Multi-tenant production, packing verification, and optional B2B catalog (BETA).",
    href: "/commissary-kitchen-software",
    icpTier: "P0",
  },
  {
    id: "catering",
    emoji: "🍽️",
    title: "Catering & events",
    tagline: "Quote-to-production, packing sheets, and delivery handoff — dispatch labeled BETA.",
    href: "/catering-management",
    icpTier: "secondary",
  },
] as const;

export const VERTICAL_MESSAGING_HONESTY_NOTE =
  "Pilot scope: ≤5 locations, qualified BETA/SKIPPED labels, no hardware lease required. See /trust for integration maturity." as const;

export function getVerticalMessagingSegmentById(
  id: VerticalMessagingSegmentId,
): VerticalMessagingSegment | undefined {
  return VERTICAL_MESSAGING_SEGMENTS.find((segment) => segment.id === id);
}
