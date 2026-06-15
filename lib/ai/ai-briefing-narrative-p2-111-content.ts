import {
  AI_BRIEFING_NARRATIVE_P2_111_ROUTE,
  AI_BRIEFING_NARRATIVE_P2_111_SECTION_COUNT,
  AI_BRIEFING_NARRATIVE_P2_111_TODAY_ROUTE,
} from "@/lib/ai/ai-briefing-narrative-p2-111-policy";

export const AI_BRIEFING_NARRATIVE_P2_111_EYEBROW =
  "AI briefing narrative · owner daily story" as const;

export const AI_BRIEFING_NARRATIVE_P2_111_HEADLINE =
  'Yesterday +12%. DoorDash orders. Next: menu mix.' as const;

export const AI_BRIEFING_NARRATIVE_P2_111_SUBLINE =
  "Three-part narrative — yesterday performance delta, top channel highlight, and suggested next step from tenant data. BETA: verify against your POS and channel reports — typical directional briefing, not certified financial audit." as const;

export const AI_BRIEFING_NARRATIVE_P2_111_SECTIONS = [
  {
    id: "yesterday",
    label: "Yesterday",
    description: "Order or revenue delta vs prior period — e.g. Yesterday +12%.",
    module: "lib/briefing/owner-daily-briefing-era19.ts",
    route: AI_BRIEFING_NARRATIVE_P2_111_TODAY_ROUTE,
  },
  {
    id: "channel-mix",
    label: "Channel mix",
    description: "Top delivery or order channel highlight — e.g. DoorDash orders up 18%.",
    module: "services/briefing/owner-daily-briefing-service.ts",
    route: AI_BRIEFING_NARRATIVE_P2_111_ROUTE,
  },
  {
    id: "next-step",
    label: "Next step",
    description: "Suggested operator action — e.g. Next: review menu mix.",
    module: "lib/ai/ai-action-drafts-p2-106-operations.ts",
    route: "/dashboard/ai/action-drafts",
  },
] as const;

export const AI_BRIEFING_NARRATIVE_P2_111_OPERATOR_LINKS = [
  { label: "Today", href: AI_BRIEFING_NARRATIVE_P2_111_TODAY_ROUTE },
  { label: "Action drafts", href: "/dashboard/ai/action-drafts" },
  { label: "No hallucination mode", href: "/dashboard/ai/no-hallucination-mode" },
] as const;

export { AI_BRIEFING_NARRATIVE_P2_111_ROUTE, AI_BRIEFING_NARRATIVE_P2_111_SECTION_COUNT };
