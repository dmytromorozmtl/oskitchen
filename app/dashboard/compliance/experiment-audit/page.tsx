import Link from "next/link";

import { requireExperimentAuditorAccess } from "@/lib/auth/experiment-auditor-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { runExperimentAuditControlChecks } from "@/services/storefront/experiment-audit-control-service";
import { ExperimentAuditManifestDiff } from "@/components/dashboard/compliance/experiment-audit-manifest-diff";
import { Soc2Type2ControlsCard } from "@/components/dashboard/compliance/soc2-type2-controls-card";
import { BqPrivateLinkCard } from "@/components/dashboard/compliance/bq-private-link-card";
import { Iso27001CrosswalkCard } from "@/components/dashboard/compliance/iso27001-crosswalk-card";
import { HipaaBaaCard } from "@/components/dashboard/compliance/hipaa-baa-card";
import { PciDssSaqCard } from "@/components/dashboard/compliance/pci-dss-saq-card";
import { FedRampHighCard } from "@/components/dashboard/compliance/fedramp-high-card";
import { EuAiActCard } from "@/components/dashboard/compliance/eu-ai-act-card";
import { CmmcL3Card } from "@/components/dashboard/compliance/cmmc-l3-card";
import { UkAiSafetyCard } from "@/components/dashboard/compliance/uk-ai-safety-card";
import { StateRampTxRampCard } from "@/components/dashboard/compliance/stateramp-txramp-card";
import { Eo14110Card } from "@/components/dashboard/compliance/eo-14110-card";
import { IrapEssentialEightCard } from "@/components/dashboard/compliance/irap-essential-eight-card";
import { NistAiRmfCard } from "@/components/dashboard/compliance/nist-ai-rmf-card";
import { NistAiRmfLiveControlFeedCard } from "@/components/dashboard/compliance/nist-ai-rmf-live-control-feed-card";
import { EuAiActArt71PmmLiveCard } from "@/components/dashboard/compliance/eu-ai-act-art71-pmm-live-card";
import { UsFtcAiTransparencyLiveCard } from "@/components/dashboard/compliance/us-ftc-ai-transparency-live-card";
import { ThemeExperimentHypergraphL6Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l6-card";
import { OecdStateAgAiTransparencyMeshCard } from "@/components/dashboard/compliance/oecd-state-ag-ai-transparency-mesh-card";
import { ThemeExperimentHypergraphL7Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l7-card";
import { UnAiOfficeGlobalRegistryMeshCard } from "@/components/dashboard/compliance/un-ai-office-global-registry-mesh-card";
import { IcaoImoAiAviationRegistryCard } from "@/components/dashboard/compliance/icao-imo-ai-aviation-registry-card";
import { WtoUpuCrossBorderAiTradeRegistryCard } from "@/components/dashboard/compliance/wto-upu-cross-border-ai-trade-registry-card";
import { ItuUncitralDigitalCommerceAiRegistryCard } from "@/components/dashboard/compliance/itu-uncitral-digital-commerce-ai-registry-card";
import { IsoIecAiStandardsHarmonizationRegistryCard } from "@/components/dashboard/compliance/iso-iec-ai-standards-harmonization-registry-card";
import { CenCenelecDigitalProductGovernanceRegistryCard } from "@/components/dashboard/compliance/cen-cenelec-digital-product-governance-registry-card";
import { ThemeExperimentHypergraphL8Card } from "@/components/dashboard/storefront/theme-experiment-hypergraph-l8-card";
import { IsmapNzismCard } from "@/components/dashboard/compliance/ismap-nzism-card";
import { Iso42001Card } from "@/components/dashboard/compliance/iso-42001-card";
import { PspfNzDtaCard } from "@/components/dashboard/compliance/pspf-nz-dta-card";
import { Iso42001Stage2Card } from "@/components/dashboard/compliance/iso-42001-stage2-card";
import { SociNzGcdoCard } from "@/components/dashboard/compliance/soci-nz-gcdo-card";
import { Iso42001CertBodyCard } from "@/components/dashboard/compliance/iso-42001-cert-body-card";
import { FiveEyesCloudCompactCard } from "@/components/dashboard/compliance/five-eyes-cloud-compact-card";
import { EuAiOfficeNotifiedBodyCard } from "@/components/dashboard/compliance/eu-ai-office-notified-body-card";
import { FiveEyesPlusCompactCard } from "@/components/dashboard/compliance/five-eyes-plus-compact-card";
import { EuAiOfficeContinuousConformityCard } from "@/components/dashboard/compliance/eu-ai-office-continuous-conformity-card";
import { ProductionHardeningCard } from "@/components/dashboard/compliance/production-hardening-card";
import { IndoPacificCompactCard } from "@/components/dashboard/compliance/indo-pacific-compact-card";
import { EuAiActLiveRegistryCard } from "@/components/dashboard/compliance/eu-ai-act-live-registry-card";
import { UkDsitAlgorithmicTransparencyCard } from "@/components/dashboard/compliance/uk-dsit-algorithmic-transparency-card";
import { prisma } from "@/lib/prisma";
import { readSoc2ManifestFromReplica } from "@/services/storefront/experiment-fedramp-s3-service";
import { listAuditorScopedExperimentAuditEvents } from "@/lib/prisma/experiment-auditor-rls";
import {
  listSoc2EvidenceObjects,
  readSoc2ManifestFromS3,
  readSoc2ManifestPreviousFromS3,
  type Soc2Manifest,
} from "@/services/storefront/experiment-soc2-s3-service";

function manifestFromUnknown(raw: unknown): Soc2Manifest | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.generatedAt !== "string" || !Array.isArray(o.stores)) return null;
  return raw as Soc2Manifest;
}

export default async function ExperimentAuditCompliancePage() {
  const user = await requireExperimentAuditorAccess();
  const sf = await prisma.storefrontSettings.findFirst({
    where: { userId: user.id },
    select: { themeExperimentJson: true },
  });
  const control = await runExperimentAuditControlChecks();
  const manifest = manifestFromUnknown(await readSoc2ManifestFromS3());
  const manifestPrevious = manifestFromUnknown(await readSoc2ManifestPreviousFromS3());
  const manifestReplica = manifestFromUnknown(await readSoc2ManifestFromReplica());
  const objects = await listSoc2EvidenceObjects("soc2/");
  const auditSample = await listAuditorScopedExperimentAuditEvents({ limit: 10 });

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Experiment audit (SOC2)</h1>
        <p className="mt-2 text-muted-foreground">
          PLATFORM_READONLY_AUDITOR — signed exports, S3 manifest, continuous controls. Read-only.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Continuous controls (24h)</CardTitle>
          <CardDescription>Real-time checks on immutable audit stream.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className={control.ok ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700"}>
            {control.ok ? "All controls passed" : "One or more controls failed"}
          </p>
          <ul className="space-y-1">
            {control.checks.map((c) => (
              <li key={c.id}>
                {c.passed ? "✓" : "✗"} {c.id}: {c.detail}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Soc2Type2ControlsCard />

      <BqPrivateLinkCard />

      <Iso27001CrosswalkCard />

      <HipaaBaaCard />

      <PciDssSaqCard />

      <FedRampHighCard />

      <EuAiActCard />

      <CmmcL3Card />

      <UkAiSafetyCard />

      <StateRampTxRampCard />

      <Eo14110Card />

      <IrapEssentialEightCard />

      <NistAiRmfCard />

      <NistAiRmfLiveControlFeedCard themeExperimentJson={sf?.themeExperimentJson} />

      <EuAiActArt71PmmLiveCard themeExperimentJson={sf?.themeExperimentJson} />

      <UsFtcAiTransparencyLiveCard themeExperimentJson={sf?.themeExperimentJson} />

      <ThemeExperimentHypergraphL6Card themeExperimentJson={sf?.themeExperimentJson} />

      <OecdStateAgAiTransparencyMeshCard themeExperimentJson={sf?.themeExperimentJson} />

      <ThemeExperimentHypergraphL7Card themeExperimentJson={sf?.themeExperimentJson} />

      <UnAiOfficeGlobalRegistryMeshCard themeExperimentJson={sf?.themeExperimentJson} />

      <IcaoImoAiAviationRegistryCard themeExperimentJson={sf?.themeExperimentJson} />

      <WtoUpuCrossBorderAiTradeRegistryCard themeExperimentJson={sf?.themeExperimentJson} />

      <ItuUncitralDigitalCommerceAiRegistryCard themeExperimentJson={sf?.themeExperimentJson} />

      <IsoIecAiStandardsHarmonizationRegistryCard themeExperimentJson={sf?.themeExperimentJson} />

      <CenCenelecDigitalProductGovernanceRegistryCard themeExperimentJson={sf?.themeExperimentJson} />

      <ThemeExperimentHypergraphL8Card themeExperimentJson={sf?.themeExperimentJson} />

      <IsmapNzismCard themeExperimentJson={sf?.themeExperimentJson} />

      <Iso42001Card themeExperimentJson={sf?.themeExperimentJson} />

      <PspfNzDtaCard themeExperimentJson={sf?.themeExperimentJson} />

      <Iso42001Stage2Card themeExperimentJson={sf?.themeExperimentJson} />

      <SociNzGcdoCard themeExperimentJson={sf?.themeExperimentJson} />

      <Iso42001CertBodyCard themeExperimentJson={sf?.themeExperimentJson} />

      <FiveEyesCloudCompactCard themeExperimentJson={sf?.themeExperimentJson} />

      <EuAiOfficeNotifiedBodyCard themeExperimentJson={sf?.themeExperimentJson} />

      <FiveEyesPlusCompactCard themeExperimentJson={sf?.themeExperimentJson} />

      <EuAiOfficeContinuousConformityCard themeExperimentJson={sf?.themeExperimentJson} />

      <ProductionHardeningCard themeExperimentJson={sf?.themeExperimentJson} />

      <IndoPacificCompactCard themeExperimentJson={sf?.themeExperimentJson} />

      <EuAiActLiveRegistryCard themeExperimentJson={sf?.themeExperimentJson} />

      <UkDsitAlgorithmicTransparencyCard themeExperimentJson={sf?.themeExperimentJson} />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>SOC2 evidence manifest (S3)</CardTitle>
          <CardDescription>
            Loaded from <code className="rounded bg-muted px-1 text-xs">AUDIT_ARCHIVE_S3_BUCKET</code> — no server
            filesystem. Downloads use presigned URLs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ExperimentAuditManifestDiff current={manifest} previous={manifestPrevious} />
          {manifestReplica ? (
            <p className="text-xs text-emerald-700">
              FedRAMP replica region manifest OK ({manifestReplica.stores.length} stores).
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Replica manifest not found — run soc2-fedramp-replicate cron.
            </p>
          )}
          {manifest ? (
            <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(manifest, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              No S3 manifest yet. Run weekly SOC2 cron or upload via evidence pack.
            </p>
          )}
          {objects.length > 0 ? (
            <ul className="max-h-48 space-y-1 overflow-auto text-xs">
              {objects.slice(0, 20).map((obj) => {
                const key = obj.Key?.replace(/^experiment-audit\//, "") ?? "";
                return (
                  <li key={obj.Key} className="flex justify-between gap-2 font-mono">
                    <span className="truncate">{obj.Key}</span>
                    {key.startsWith("soc2/") ? (
                      <a
                        className="shrink-0 text-primary underline"
                        href={`/api/dashboard/compliance/experiment-audit-download?key=${encodeURIComponent(key)}`}
                      >
                        Presign
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
          {auditSample.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              RLS-scoped audit sample: {auditSample.length} events (PII redacted, no workspace tables).
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <a href="/api/dashboard/storefront/experiment-audit-export?days=90&signed=1">Download signed CSV (90d)</a>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/storefront/settings/experiments">Experiment settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
