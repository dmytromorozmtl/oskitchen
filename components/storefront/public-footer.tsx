import Link from "next/link";

export function StorefrontPublicFooter({
  storeSlug,
  publicName,
  contactEmail,
  privacyText,
}: {
  storeSlug: string;
  publicName: string;
  contactEmail: string | null;
  privacyText: string | null;
}) {
  return (
    <footer className="mt-auto border-t border-border/80 bg-card/60 py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">{publicName}</p>
          <p className="mt-1 max-w-sm">Preorder & catering powered by KitchenOS.</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">Explore</span>
          <Link href={`/s/${storeSlug}/menu`} className="hover:text-foreground">
            Menu
          </Link>
          <Link href={`/s/${storeSlug}/contact`} className="hover:text-foreground">
            Contact
          </Link>
          <Link href={`/s/${storeSlug}/faq`} className="hover:text-foreground">
            FAQ
          </Link>
          <Link href={`/s/${storeSlug}/account`} className="hover:text-foreground">
            My orders
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">Policies</span>
          <Link href={`/s/${storeSlug}/policies/privacy`} className="hover:text-foreground">
            Privacy
          </Link>
          <Link href={`/s/${storeSlug}/policies/terms`} className="hover:text-foreground">
            Terms
          </Link>
        </div>
        {contactEmail ? (
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">Email</span>
            <p className="mt-1">
              <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            </p>
          </div>
        ) : null}
        {privacyText ? (
          <div className="max-w-md">
            <span className="text-xs font-medium uppercase tracking-wide text-foreground/80">Privacy</span>
            <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed">{privacyText}</p>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
