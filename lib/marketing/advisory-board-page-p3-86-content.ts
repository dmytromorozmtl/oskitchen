import {
  ADVISORY_BOARD_PAGE_P3_86_HONESTY_MARKERS,
  ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE,
  ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_MEMBER_COUNT,
} from "@/lib/marketing/advisory-board-page-p3-86-policy";

export const ADVISORY_BOARD_PAGE_P3_86_RECRUITING_COPY = {
  eyebrow: "Recruiting — operator feedback group",
  title: "Customer Advisory Board",
  description:
    "Apply to join a small group of meal prep, catering, and ghost-kitchen operators shaping OS Kitchen. This is a product feedback program — not a paid endorsement or investor board.",
  honestyNote:
    "We have no published advisory board members yet. Names and logos appear only with explicit written permission after acceptance.",
  targetSize: "5–10 operators",
  idealProfiles: [
    "Meal prep owners (100+ weekly orders)",
    "Catering managers with repeat events",
    "Bakery preorder operators",
    "Ghost / cloud kitchen operators",
  ],
} as const;

export const ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE_LABEL = ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE;

export const ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_COUNT =
  ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_MEMBER_COUNT;

export function advisoryBoardHonestyMarkersPresent(source: string): boolean {
  const lower = source.toLowerCase().replace(/\s+/g, " ");
  return ADVISORY_BOARD_PAGE_P3_86_HONESTY_MARKERS.every((marker) =>
    lower.includes(marker.toLowerCase()),
  );
}
