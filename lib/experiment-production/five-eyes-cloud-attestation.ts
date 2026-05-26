/**
 * Five Eyes+ cloud residency attestations from AWS/GCP/Azure APIs (4.1).
 */

import { createHash } from "node:crypto";

import type { FiveEyesPlusCompactEvidence } from "@/lib/compliance/five-eyes-plus-compact";

export type CloudAttestationProof = {
  cloud: "aws" | "gcp" | "azure";
  region: string;
  attestationDocumentHash: string;
  status: "verified" | "unavailable";
  at: string;
};

export function isFiveEyesCloudAttestationEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_FIVE_EYES_CLOUD_ATTESTATION === "1";
}

/** Fetch or synthesize cloud attestation proofs for sovereign regions. */
export async function fetchCloudResidencyAttestations(): Promise<CloudAttestationProof[]> {
  const regions: { cloud: CloudAttestationProof["cloud"]; region: string }[] = [
    { cloud: "aws", region: "ap-southeast-2" },
    { cloud: "gcp", region: "australia-southeast1" },
    { cloud: "azure", region: "australiaeast" },
  ];

  const proofs: CloudAttestationProof[] = [];

  for (const { cloud, region } of regions) {
    let status: CloudAttestationProof["status"] = "unavailable";
    let doc = "";

    if (isFiveEyesCloudAttestationEnabled()) {
      const attestUrl = process.env[`${cloud.toUpperCase()}_ATTESTATION_URL`]?.trim();
      if (attestUrl) {
        try {
          const res = await fetch(`${attestUrl}?region=${encodeURIComponent(region)}`, {
            headers: process.env.CLOUD_ATTESTATION_API_KEY
              ? { authorization: `Bearer ${process.env.CLOUD_ATTESTATION_API_KEY}` }
              : {},
          });
          if (res.ok) {
            const body = await res.text();
            doc = body;
            status = "verified";
          }
        } catch {
          status = "unavailable";
        }
      } else {
        doc = `legal-sign-off:${cloud}:${region}:${process.env.FIVE_EYES_LEGAL_SIGNOFF_ID ?? "pending"}`;
        status = process.env.FIVE_EYES_LEGAL_SIGNOFF_ID ? "verified" : "unavailable";
      }
    }

    proofs.push({
      cloud,
      region,
      attestationDocumentHash: createHash("sha3-256").update(doc || `${cloud}:${region}`).digest("hex"),
      status,
      at: new Date().toISOString(),
    });
  }

  return proofs;
}

export function mergeCloudAttestationsIntoFiveEyesPlus(
  ev: FiveEyesPlusCompactEvidence,
  proofs: CloudAttestationProof[],
): FiveEyesPlusCompactEvidence & { cloudAttestations: CloudAttestationProof[] } {
  const allVerified = proofs.every((p) => p.status === "verified");
  return {
    ...ev,
    fiveEyesPlusReady: ev.fiveEyesPlusReady && (!isFiveEyesCloudAttestationEnabled() || allVerified),
    cloudAttestations: proofs,
  };
}
