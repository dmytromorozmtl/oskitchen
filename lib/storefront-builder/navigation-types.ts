/**
 * Logical shape for `StorefrontNavigation.itemsJson`.
 * Actual JSON in DB may vary — validate at save time in actions.
 */
export type NavItemTarget =
  | { kind: "home" }
  | { kind: "menu" }
  | { kind: "cart" }
  | { kind: "about" }
  | { kind: "contact" }
  | { kind: "catering" }
  | { kind: "faq" }
  | { kind: "policies_privacy" }
  | { kind: "policies_terms" }
  | { kind: "page"; slug: string }
  | { kind: "external"; href: string; newTab?: boolean };

export type NavItem = {
  id: string;
  /** Default / fallback label (typically English). */
  label: string;
  /** Optional per-locale labels (`en`, `fr`, …). Missing keys fall back to `label`. */
  labels?: Record<string, string>;
  /** Optional emoji or short icon key (e.g. `menu`, `cart`). */
  icon?: string;
  target: NavItemTarget;
  /** Nested dropdown links (one level). */
  children?: NavItem[];
  /** Optional: hide on small screens until hamburger. */
  mobile?: boolean;
  desktop?: boolean;
  /** When false or missing, item is public. */
  published?: boolean;
  /** Soft-hide without deleting. */
  hidden?: boolean;
};
