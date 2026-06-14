import Link from "next/link";

import {
  TRUST_PAGE_SECURITY_DETAIL_CARDS,
  TRUST_PAGE_WEBHOOK_SIGNATURE_VERIFIED_COUNT,
} from "@/lib/marketing/trust-page-security-p1-27-content";
import { TRUST_PAGE_SECURITY_P1_27_TEST_ID } from "@/lib/marketing/trust-page-security-p1-27-policy";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Public security detail cards — webhook 59/59, uptime, residency, GDPR, PCI (P1-27). */
export function TrustPageSecurityDetailsSection() {
  return (
    <section
      className="mx-auto max-w-6xl px-4 pb-16 sm:px-6"
      aria-labelledby="trust-security-details-heading"
      data-testid={TRUST_PAGE_SECURITY_P1_27_TEST_ID}
    >
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Security details</p>
        <h2 id="trust-security-details-heading" className="text-2xl font-semibold tracking-tight">
          Webhook verification, uptime, residency, GDPR, and PCI — honestly documented
        </h2>
        <p className="text-muted-foreground">
          Procurement reviewers ask for specifics. Below are engineering-backed facts with explicit
          limits — not certification badges. Webhook ingress:{" "}
          <span className="font-medium text-foreground">
            {TRUST_PAGE_WEBHOOK_SIGNATURE_VERIFIED_COUNT}/59 signature verified
          </span>{" "}
          in static audit.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {TRUST_PAGE_SECURITY_DETAIL_CARDS.map((card) => (
          <Card key={card.id} className="border-border/80" data-testid={`trust-security-${card.id}`}>
            <CardHeader className="space-y-3 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{card.title}</CardTitle>
                <Badge variant="secondary" className="rounded-full text-xs">
                  {card.statusLabel}
                </Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed">{card.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
                {card.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {card.href && card.hrefLabel ? (
                <p className="text-sm">
                  <Link
                    href={card.href}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {card.hrefLabel}
                  </Link>
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border/80 bg-muted/20 p-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Honesty ceiling</p>
        <p className="mt-2">
          These details describe implemented controls and published audit artifacts. They are not SOC
          2, HIPAA, PCI DSS, or GDPR certification claims. For enterprise questionnaires, share{" "}
          <Link href="/legal/data-rights" className="text-primary underline-offset-4 hover:underline">
            data rights templates
          </Link>{" "}
          and request founder review before custom security language.
        </p>
      </div>
    </section>
  );
}
