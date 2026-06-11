/**
 * Blueprint P1-30 — KDS keyboard navigation (bump/recall, sound toggle).
 */

export const KDS_KEYBOARD_NAVIGATION_POLICY_ID = "kds-keyboard-navigation-p1-30-v1" as const;

export const KDS_KEYBOARD_NAVIGATION_ROUTE = "/dashboard/kitchen" as const;

export const KDS_KEYBOARD_NAVIGATION_SPEC_PATH = "e2e/kds-keyboard-navigation.spec.ts" as const;

export const KDS_KEYBOARD_NAVIGATION_CI_SCRIPTS = [
  "test:ci:kds-keyboard-navigation",
  "test:e2e:kds-keyboard",
] as const;

export const KDS_KEYBOARD_TEST_IDS = {
  shell: "kds-tablet-landscape-shell",
  bumpNextButton: "kds-bump-next-button",
  recallNextButton: "kds-recall-next-button",
  ticketBumpButton: "kds-ticket-bump-button",
  soundToggle: "kds-sound-toggle",
} as const;

export const KDS_KEYBOARD_NAVIGATION_FLOWS = [
  { id: "focus_sound_toggle", key: "Tab", label: "Reach kitchen sound alerts toggle" },
  { id: "focus_bump_next", key: "Tab", label: "Reach bump-next hero button" },
  { id: "activate_bump_next", key: "Enter", label: "Activate focused bump button" },
] as const;

export const KDS_KEYBOARD_ARIA_PATTERNS = [
  "Mark order",
  "Recall order",
  "kitchen sound alerts",
] as const;
