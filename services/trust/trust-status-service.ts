export type TrustControlStatus = "implemented" | "partial" | "roadmap";

export type TrustControlRow = {
  control: string;
  status: TrustControlStatus;
  notes: string;
};

export function loadTrustControlMatrix(): TrustControlRow[] {
  return [
    {
      control: "Encryption in transit (TLS)",
      status: "implemented",
      notes: "Standard HTTPS deployment responsibility of hosting provider.",
    },
    {
      control: "Secrets management",
      status: "partial",
      notes: "Env-based secrets; no echo in UI — rotation runbooks are customer-operated.",
    },
    {
      control: "SSO / SCIM",
      status: "roadmap",
      notes: "Not claimed as GA — enterprise deals should assume project-based rollout.",
    },
    {
      control: "SOC 2 Type II",
      status: "roadmap",
      notes: "Do not market as certified unless an attestation exists for your deployment.",
    },
  ];
}
