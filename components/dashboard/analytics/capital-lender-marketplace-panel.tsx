"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Handshake,
  Layers3,
} from "lucide-react";

import {
  consentCapitalLenderOfferAction,
  revokeCapitalLenderOAuthGrantAction,
  selectCapitalReferralOfferAction,
} from "@/actions/capital-lender-offers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  CAPITAL_LENDER_CONSENT_COPY,
  CAPITAL_LENDER_OFFER_DISCLAIMER,
} from "@/lib/commercial/capital-lender-offers";
import { CAPITAL_LENDER_OAUTH_CONSENT_NOTE } from "@/lib/commercial/capital-lender-oauth";
import type { CapitalPartner, CapitalRegion } from "@/lib/commercial/capital-partners";
import type {
  CapitalMarketplaceReferralRow,
  CapitalMarketplaceSnapshot,
} from "@/services/commercial/capital-multi-lender-service";
import type { RevenueAttestationListRow } from "@/services/commercial/revenue-attestation-service";
import { formatCurrency } from "@/lib/utils";

type CapitalLenderMarketplacePanelProps = {
  marketplace: CapitalMarketplaceSnapshot;
  recentAttestations: RevenueAttestationListRow[];
  hasOrderData: boolean;
};

function lifecycleBadge(status: CapitalPartner["offerLifecycleStatus"]) {
  switch (status) {
    case "live":
      return <Badge variant="default">Live partner</Badge>;
    case "paused":
      return <Badge variant="outline">Paused</Badge>;
    default:
      return <Badge variant="secondary">Sandbox</Badge>;
  }
}

function referralFeeBadge(partner: CapitalPartner) {
  if (!partner.referralFee) return null;
  const bps = partner.referralFeeBps;
  return (
    <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-200">
      Referral fee{bps != null ? ` ${(bps / 100).toFixed(2)}%` : ""}
    </Badge>
  );
}

function statusLabel(status: CapitalMarketplaceReferralRow["status"]) {
  switch (status) {
    case "CONSENTED":
      return "Consent recorded";
    case "ATTESTATION_SHARED":
      return "Revenue shared";
    case "OFFER_VIEWED":
      return "Offer opened";
    case "APPLIED":
      return "Application submitted";
    case "FUNDED":
      return "Funded";
    case "DECLINED":
      return "Declined";
    case "WITHDRAWN":
      return "Withdrawn";
    default:
      return status;
  }
}

function formatOfferAmount(min: number | null, max: number | null, currency: string) {
  if (min != null && max != null) {
    return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
  }
  if (max != null) return `Up to ${formatCurrency(max, currency)}`;
  if (min != null) return `From ${formatCurrency(min, currency)}`;
  return "Amount set by lender";
}

function LenderOfferCard({
  partner,
  recentAttestations,
  hasOrderData,
  existingReferral,
}: {
  partner: CapitalPartner;
  recentAttestations: RevenueAttestationListRow[];
  hasOrderData: boolean;
  existingReferral: CapitalMarketplaceReferralRow | null;
}) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [useOAuth, setUseOAuth] = useState(Boolean(partner.oauthEnabled));
  const [attestationId, setAttestationId] = useState(
    recentAttestations.find((row) => !row.expired)?.id ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selectPending, startSelectTransition] = useTransition();

  const activeAttestations = recentAttestations.filter((row) => !row.expired);

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {partner.offerProgramName ?? partner.name}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {lifecycleBadge(partner.offerLifecycleStatus)}
            {referralFeeBadge(partner)}
            {partner.oauthEnabled ? (
              <Badge variant="secondary">OAuth pull</Badge>
            ) : null}
            <Badge variant="outline">{partner.regions.join(", ")}</Badge>
          </div>
        </div>
        <CardDescription>{partner.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {partner.offerAmountLabel ? (
          <p className="text-sm font-medium">{partner.offerAmountLabel}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">{partner.offerDisclosure}</p>
        {partner.stateDisclosureUrl ? (
          <p className="text-xs">
            <a
              href={partner.stateDisclosureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              View lender state disclosures
            </a>
          </p>
        ) : null}

        {existingReferral ? (
          <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">Active referral</span>
              <div className="flex flex-wrap gap-2">
                {existingReferral.oauthConnected ? (
                  <Badge variant="default">OAuth connected</Badge>
                ) : existingReferral.oauthRevokedAt ? (
                  <Badge variant="outline">OAuth revoked</Badge>
                ) : null}
                <Badge variant="outline">{statusLabel(existingReferral.status)}</Badge>
              </div>
            </div>
            {existingReferral.oauthConnected && existingReferral.oauthLastAccessAt ? (
              <p className="text-xs text-muted-foreground">
                Last OAuth attestation pull:{" "}
                {new Date(existingReferral.oauthLastAccessAt).toLocaleString()}
              </p>
            ) : null}

            {existingReferral.partnerOffers.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Compare lender-provided offers</p>
                {existingReferral.partnerOffers.map((offer) => (
                  <div
                    key={offer.offerId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{offer.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatOfferAmount(offer.amountMin, offer.amountMax, offer.currency)}
                        {offer.termLabel ? ` · ${offer.termLabel}` : ""}
                        {offer.rateLabel ? ` · ${offer.rateLabel}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {offer.isSelected ? (
                        <Badge>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Selected
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={selectPending}
                          onClick={() =>
                            startSelectTransition(async () => {
                              const formData = new FormData();
                              formData.set("referralId", existingReferral.referralId);
                              formData.set("offerId", offer.offerId);
                              const result = await selectCapitalReferralOfferAction(formData);
                              if ("error" in result && result.error) {
                                setError(result.error);
                                return;
                              }
                              if ("deepLink" in result && result.deepLink) {
                                window.open(result.deepLink, "_blank", "noopener,noreferrer");
                              }
                              router.refresh();
                            })
                          }
                        >
                          Select offer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {existingReferral.offerDeepLink ? (
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <a href={existingReferral.offerDeepLink} target="_blank" rel="noopener noreferrer">
                  Open application
                </a>
              </Button>
            ) : null}
            {existingReferral.oauthConnected ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full text-destructive"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    const formData = new FormData();
                    formData.set("referralId", existingReferral.referralId);
                    const result = await revokeCapitalLenderOAuthGrantAction(formData);
                    if ("error" in result && result.error) {
                      setError(result.error);
                      return;
                    }
                    router.refresh();
                  })
                }
              >
                Revoke OAuth access
              </Button>
            ) : null}
          </div>
        ) : !hasOrderData ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-2 text-sm text-muted-foreground">
            Capture revenue-eligible orders and generate a signed export before sharing with a lender.
          </p>
        ) : activeAttestations.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-2 text-sm text-muted-foreground">
            <Link href="#revenue-attestation" className="text-primary underline">
              Generate a signed revenue export
            </Link>{" "}
            above, then return here to share it with this partner.
          </p>
        ) : (
          <div className="space-y-3 rounded-lg border border-border/70 p-3">
            <div className="space-y-2">
              <Label htmlFor={`attestation-${partner.slug}`}>Revenue export to share</Label>
              <select
                id={`attestation-${partner.slug}`}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={attestationId}
                onChange={(e) => setAttestationId(e.target.value)}
              >
                {activeAttestations.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.periodStart} → {row.periodEnd}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-1"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>{CAPITAL_LENDER_CONSENT_COPY}</span>
            </label>
            {partner.oauthEnabled ? (
              <>
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={useOAuth}
                    onChange={(e) => setUseOAuth(e.target.checked)}
                  />
                  <span>{CAPITAL_LENDER_OAUTH_CONSENT_NOTE}</span>
                </label>
              </>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={pending || !consent || !attestationId}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const formData = new FormData();
                  formData.set("partnerSlug", partner.slug);
                  formData.set("attestationId", attestationId);
                  formData.set("consentAccepted", "true");
                  if (useOAuth && partner.oauthEnabled) {
                    formData.set("useOAuth", "true");
                  }
                  const result = await consentCapitalLenderOfferAction(formData);
                  if ("error" in result && result.error) {
                    setError(result.error);
                    return;
                  }
                  if ("oauthAuthorizeUrl" in result && result.oauthAuthorizeUrl) {
                    window.location.href = result.oauthAuthorizeUrl;
                    return;
                  }
                  if ("offerDeepLink" in result && result.offerDeepLink) {
                    window.open(result.offerDeepLink, "_blank", "noopener,noreferrer");
                  }
                  router.refresh();
                })
              }
            >
              <ExternalLink className="h-4 w-4" />
              <span className="ml-2">
                {pending
                  ? "Preparing…"
                  : useOAuth && partner.oauthEnabled
                    ? "Authorize OAuth & continue"
                    : "Continue to partner"}
              </span>
            </Button>
          </div>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

export function CapitalLenderMarketplacePanel({
  marketplace,
  recentAttestations,
  hasOrderData,
}: CapitalLenderMarketplacePanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const region = marketplace.region;

  const referralByPartner = useMemo(() => {
    const map = new Map<string, CapitalMarketplaceReferralRow>();
    for (const referral of marketplace.referrals) {
      if (!map.has(referral.partnerSlug)) {
        map.set(referral.partnerSlug, referral);
      }
    }
    return map;
  }, [marketplace.referrals]);

  if (marketplace.partners.length === 0 && marketplace.referrals.length === 0) {
    return null;
  }

  return (
    <Card id="lender-offers" className="scroll-mt-24 border-border/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Handshake className="h-4 w-4" />
          Lender marketplace
        </CardTitle>
        <CardDescription>
          Compare live financing partners by region, share signed revenue exports with consent, and
          track referral status in one inbox. Sandbox partners appear in development only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          <p className="flex items-start gap-2 font-medium text-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            Third-party offers only
          </p>
          <p className="mt-2">{CAPITAL_LENDER_OFFER_DISCLAIMER}</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="capitalRegion" className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              Region
            </Label>
            <select
              id="capitalRegion"
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={region}
              disabled={pending}
              onChange={(e) => {
                const next = e.target.value as CapitalRegion;
                const params = new URLSearchParams(searchParams.toString());
                params.set("region", next);
                startTransition(() => {
                  router.push(`/dashboard/analytics/capital?${params.toString()}#lender-offers`);
                });
              }}
            >
              {marketplace.availableRegions.map((code) => (
                <option key={code} value={code}>
                  {code}
                  {code === marketplace.detectedRegion ? " (detected)" : ""}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">
            Detected from workspace country: {marketplace.detectedRegion}. Showing{" "}
            {marketplace.partners.length} partner
            {marketplace.partners.length === 1 ? "" : "s"} for {region}.
          </p>
        </div>

        {marketplace.partners.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Partner</th>
                  <th className="px-3 py-2">Program</th>
                  <th className="px-3 py-2">Illustrative amount</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {marketplace.partners.map((partner) => {
                  const referral = referralByPartner.get(partner.slug) ?? null;
                  return (
                    <tr key={partner.slug} className="border-t border-border/60">
                      <td className="px-3 py-3 font-medium">{partner.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {partner.offerProgramName ?? partner.category}
                      </td>
                      <td className="px-3 py-3">{partner.offerAmountLabel ?? "Set by lender"}</td>
                      <td className="px-3 py-3">
                        {referral ? (
                          <Badge variant="outline">{statusLabel(referral.status)}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Not started</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-2 text-sm text-muted-foreground">
            No embedded lender partners are active for {region} yet. Browse government and education
            resources below, or switch region.
          </p>
        )}

        {marketplace.partners.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {marketplace.partners.map((partner) => (
              <LenderOfferCard
                key={partner.slug}
                partner={partner}
                recentAttestations={recentAttestations}
                hasOrderData={hasOrderData}
                existingReferral={referralByPartner.get(partner.slug) ?? null}
              />
            ))}
          </div>
        ) : null}

        {marketplace.referrals.length > 0 ? (
          <div className="space-y-3 rounded-lg border border-border/70 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Layers3 className="h-4 w-4" />
              Referral inbox
            </p>
            {marketplace.referrals.map((row) => (
              <div key={row.referralId} className="rounded-md border border-border/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    {row.partnerName} · {new Date(row.consentAt).toLocaleDateString()}
                  </span>
                  <Badge variant="outline">{statusLabel(row.status)}</Badge>
                </div>
                <ol className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {row.timeline.map((step) => (
                    <li key={step.step} className="flex items-center gap-2">
                      <span
                        className={
                          step.at ? "text-foreground" : "text-muted-foreground/70 line-through"
                        }
                      >
                        {step.step}
                      </span>
                      {step.at ? (
                        <span>{new Date(step.at).toLocaleString()}</span>
                      ) : (
                        <span>Pending</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
