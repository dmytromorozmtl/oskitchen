import Link from "next/link";

import { OSKitchenLogo } from "@/components/ui/os-kitchen-logo";
import { APP_NAME } from "@/lib/constants";
import { BRAND_POSITIONING } from "@/lib/marketing/brand-copy";

export function SiteFooter() {
  return (
    <footer className="dark-section border-t border-[var(--dark-border)] px-4 py-14 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:justify-between">
        <div>
          <OSKitchenLogo href="/" variant="light" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {BRAND_POSITIONING.footerBlurb}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-4">
          <div className="space-y-3">
            <p className="font-semibold">Product</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/product" className="hover:text-foreground">
                  Product overview
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-foreground">
                  Interactive demo
                </Link>
              </li>
              <li>
                <Link href="/book-demo" className="hover:text-foreground">
                  Book demo
                </Link>
              </li>
              <li>
                <Link href="/trust" className="hover:text-foreground">
                  Trust
                </Link>
              </li>
              <li>
                <Link href="/capabilities" className="hover:text-foreground">
                  Capabilities
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-foreground">
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/get-started" className="hover:text-foreground">
                  Get started
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground">
                  Trial
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-foreground">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Solutions</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/solutions/restaurants" className="hover:text-foreground">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/solutions/bars" className="hover:text-foreground">
                  Bars
                </Link>
              </li>
              <li>
                <Link href="/solutions/cafes" className="hover:text-foreground">
                  Cafés
                </Link>
              </li>
              <li>
                <Link href="/solutions/fast-casual" className="hover:text-foreground">
                  Fast casual
                </Link>
              </li>
              <li>
                <Link href="/solutions/meal-prep" className="hover:text-foreground">
                  Meal prep
                </Link>
              </li>
              <li>
                <Link href="/solutions/ghost-kitchens" className="hover:text-foreground">
                  Ghost kitchens
                </Link>
              </li>
              <li>
                <Link href="/solutions/catering" className="hover:text-foreground">
                  Catering
                </Link>
              </li>
              <li>
                <Link href="/solutions/bakeries" className="hover:text-foreground">
                  Bakeries
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-foreground">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Company</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/support" className="hover:text-foreground">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-foreground">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:text-foreground">
                  Customers
                </Link>
              </li>
              <li>
                <Link href="/service-areas" className="hover:text-foreground">
                  Service areas
                </Link>
              </li>
              <li>
                <Link href="/contact-sales" className="hover:text-foreground">
                  Contact sales
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Legal</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/legal/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/legal/security" className="hover:text-foreground">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/legal/dpa" className="hover:text-foreground">
                  DPA (template)
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie-policy" className="hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/acceptable-use" className="hover:text-foreground">
                  Acceptable Use
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. {BRAND_POSITIONING.tagline}
      </p>
    </footer>
  );
}
