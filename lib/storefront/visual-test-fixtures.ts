import type { ValidatedNavLink } from "@/lib/storefront/navigation-validation";

/** Stable nav tree for `/visual-test/nav-tokens` snapshots. */
export const VISUAL_TEST_NAV_LINKS: ValidatedNavLink[] = [
  { id: "menu", label: "Menu", href: "/s/visual-demo/menu", external: false, newTab: false, icon: "utensils" },
  {
    id: "shop",
    label: "Shop",
    href: null,
    external: false,
    newTab: false,
    icon: "store",
    children: [
      { id: "cakes", label: "Cakes", href: "/s/visual-demo/collections/cakes", external: false, newTab: false },
      { id: "bread", label: "Bread", href: "/s/visual-demo/collections/bread", external: false, newTab: false },
    ],
  },
  { id: "catering", label: "Catering", href: "/s/visual-demo/catering", external: false, newTab: false, icon: "calendar" },
  { id: "cart", label: "Cart", href: "/s/visual-demo/cart", external: false, newTab: false, icon: "cart" },
];

export const VISUAL_TEST_CHECKOUT_LINES = [
  { title: "Sourdough loaf", quantity: 2, lineTotal: 17 },
  { title: "Almond croissant", quantity: 1, lineTotal: 4.25 },
] as const;
