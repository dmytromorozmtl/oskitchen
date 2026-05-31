"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, Building2, ExternalLink, Handshake } from "lucide-react";

import { consentCapitalLenderOfferAction } from "@/actions/capital-lender-offers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  CAPITAL_LENDER_CONSENT_COPY,
  CAPITAL_LENDER_OFFER_DISCLAIMER,
} from "@/lib/commercial/capital-lender-offers";
import type { CapitalPartner } from "@/lib/commercial/capital-partners";
import type { CapitalLenderOfferRow } from "@/services/commercial/capital-lender-offers-service";
import type { RevenueAttestationListRow } from "@/services/commercial/revenue-attestation-service";

type CapitalLenderOffersPanelProps = {
  offerPartners: CapitalPartner[];
  referrals: CapitalLenderOfferRow[];
  recentAttestations: RevenueAttestationListRow[];
  hasOrderData: boolean;
};

function statusLabel(status: CapitalLenderOfferRow["status"]) {
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

function statusVariant(status: CapitalLenderOfferRow["status"]) {
  if (status === "FUNDED") return "default" as const;
  if (status === "DECLINED" || status === "WITHDRAWN") return "destructive" as const;
  return "outline" as const;
}

function LenderOfferCard({
  partner,
  recentAttestations,
  hasOrderData,
}: {
  partner: CapitalPartner;
  recentAttestations: RevenueAttestationListRow[];
  hasOrderData: boolean;
}) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [attestationId, setAttestationId] = useState(
    recentAttestations.find((row) => !row.expired)?.id ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activeAttestations = recentAttestations.filter((row) => !row.expired);

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {partner.offerProgramName ?? partner.name}
          </CardTitle>
          <Badge variant="outline">Lender offer</Badge>
        </div>
        <CardDescription>{partner.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {partner.offerAmountLabel ? (
          <p className="text-sm font-medium">{partner.offerAmountLabel}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">{partner.offerDisclosure}</p>
        {partner.referralFee ? (
          <p className="text-xs text-amber-700 dark:text-amber-200">
            KitchenOS may receive referral compensation for this partner.
          </p>
        ) : null}

        {!hasOrderData ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-2 text-sm text-muted-foreground">
            Capture revenue-eligible orders and generate a signed export before sharing with a lender.
          </p>
        ) : activeAttestations.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-2 text-sm text-muted-foreground">
            Generate a signed revenue export above, then return here to share it with this partner.
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
                  const result = await consentCapitalLenderOfferAction(formData);
                  if ("error" in result && result.error) {
                    setError(result.error);
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
              <span className="ml-2">{pending ? "Preparing…" : "Continue to partner"}</span>
            </Button>
          </div>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

export function CapitalLenderOffersPanel({
  offerPartners,
  referrals,
  recentAttestations,
  hasOrderData,
}: CapitalLenderOffersPanelProps) {
  if (offerPartners.length === 0) {
    return null;
  }

  return (
    <Card id="lender-offers" className="scroll-mt-24 border-border/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Handshake className="h-4 w-4" />
          Lender offers (Phase 3 BETA)
        </CardTitle>
        <CardDescription>
          Consent-required share of your signed revenue export with licensed financing partners. OS Kitchen
          does not make credit decisions.
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

        <div className="grid gap-4 md:grid-cols-2">
          {offerPartners.map((partner) => (
            <LenderOfferCard
              key={partner.slug}
              partner={partner}
              recentAttestations={recentAttestations}
              hasOrderData={hasOrderData}
            />
          ))}
        </div>

        {referrals.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border/70 p-3 text-sm">
            <p className="font-medium">Your lender referrals</p>
            {referrals.map((row) => (
              <div
                key={row.referralId}
                className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground"
              >
                <span>
                  {row.partnerName} · consented {new Date(row.consentAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                  {row.offerDeepLink ? (
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <a href={row.offerDeepLink} target="_blank" rel="noopener noreferrer">
                        Open application
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
