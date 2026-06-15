import { PublicShell, FeatureGrid, Hero } from "@/components/marketing/public-page";

export const metadata = { title: "Partner implementation" };

export default function PartnerImplementationPage() {
  return (
    <PublicShell>
      <Hero eyebrow="Partner implementation" title="Repeatable client launches." description="Track discovery, data import, configuration, staff training, test run, and go-live waves for partner-managed clients." />
      <FeatureGrid items={[
        { title: "Launch readiness", description: "Use client checklists and risk registers before production day." },
        { title: "Open blockers", description: "Escalate missing credentials, mappings, or staff training." },
        { title: "Notes", description: "Partner notes are roadmap-only until shared client permissions are finalized." },
      ]} />
    </PublicShell>
  );
}
