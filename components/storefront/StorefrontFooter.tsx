import Link from "next/link";

import { sanitizeRichHtmlForLegal } from "@/lib/storefront/rich-html-sanitizer";
import type { ValidatedFooterBlock } from "@/lib/storefront/footer-validation";

export function StorefrontFooter({
  storeSlug,
  publicName,
  contactEmail,
  privacyText,
  blocks,
  footerTagline,
  showPoweredBy = true,
}: {
  storeSlug: string;
  publicName: string;
  contactEmail: string | null;
  privacyText: string | null;
  blocks: ValidatedFooterBlock[];
  /** Shown under brand when footer blocks are empty */
  footerTagline?: string | null;
  showPoweredBy?: boolean;
}) {
  const base = `/s/${storeSlug}`;
  const safePrivacyHtml = privacyText ? sanitizeRichHtmlForLegal(privacyText) : null;
  const tagline =
    footerTagline?.trim() || "Preorder & catering.";

  return (
    <footer className="mt-auto border-t border-border/80 bg-card/60 py-10 text-sm text-muted-foreground dark:border-gray-800 dark:bg-gray-950/80">
      <div className="sf-container px-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{publicName}</p>
            <p className="mt-1 text-xs leading-relaxed">{tagline}</p>
          </div>

          {blocks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:col-span-2 sm:grid-cols-2">
              {blocks.map((b, i) =>
                b.type === "text" ? (
                  <div key={`t-${i}`} className="min-w-0">
                    {b.body ? (
                      <p className="whitespace-pre-wrap text-xs leading-relaxed">{b.body}</p>
                    ) : null}
                  </div>
                ) : (
                  <div key={`l-${i}`} className="flex min-w-0 flex-col gap-2">
                    {b.title ? (
                      <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">
                        {b.title}
                      </span>
                    ) : (
                      <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">Links</span>
                    )}
                    {b.links.map((l, j) =>
                      l.external ? (
                        <a
                          key={`${i}-${j}`}
                          href={l.href}
                          className="break-words hover:text-foreground"
                          rel="noopener noreferrer"
                          target={l.newTab ? "_blank" : undefined}
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link key={`${i}-${j}`} href={l.href} className="break-words hover:text-foreground">
                          {l.label}
                        </Link>
                      ),
                    )}
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">Explore</span>
              <Link href={`${base}/menu`} className="hover:text-foreground">
                Menu
              </Link>
              <Link href={`${base}/faq`} className="hover:text-foreground">
                FAQ
              </Link>
              <Link href={`${base}/contact`} className="hover:text-foreground">
                Contact
              </Link>
              <Link href={`${base}/policies/privacy`} className="hover:text-foreground">
                Privacy
              </Link>
              <Link href={`${base}/policies/terms`} className="hover:text-foreground">
                Terms
              </Link>
            </div>
          )}

          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">Policies</span>
            <Link href={`${base}/policies/privacy`} className="hover:text-foreground">
              Privacy
            </Link>
            <Link href={`${base}/policies/terms`} className="hover:text-foreground">
              Terms
            </Link>
          </div>

          <div className="min-w-0">
            <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">Contact</span>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="mt-1 block break-all text-xs text-[var(--store-accent,hsl(var(--primary)))] underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
            ) : (
              <p className="mt-1 text-xs italic">Contact email not set</p>
            )}
          </div>
        </div>

        {safePrivacyHtml ? (
          <div className="mt-8 max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">Privacy notice</span>
            <div
              className="kos-footer-legal prose prose-sm mt-1 max-w-none text-xs leading-relaxed text-muted-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: safePrivacyHtml }}
            />
          </div>
        ) : null}

        {showPoweredBy ? (
          <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
            Made with{" "}
            <a
              href="https://os-kitchen.com"
              className="font-medium text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              OS-Kitchen
            </a>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
