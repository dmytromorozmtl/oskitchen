import Link from "next/link";
import { AlertTriangle, Cable, CheckCircle2, XCircle } from "lucide-react";

import { IntegrationHealthMarketingExplainerSection } from "@/components/marketing/integration-health-marketing-explainer-section";
import { SyncHealthDashboardMarketing } from "@/components/marketing/sync-health-dashboard-marketing";
import { integrationHealthStatusColors } from "@/lib/design/color-tokens";
import {
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_COUNTER_TEST_ID,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_IHC_ROUTE,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_TEST_ID,
} from "@/lib/marketing/integration-health-center-hero-p1-22-policy";
import { countSyncHealthMarketingMaturity } from "@/lib/marketing/sync-health-dashboard-marketing-content";

const STATUS_ROWS = [
  {
    label: "Healthy",
    detail: "Webhook verified · credentials configured · last sync within SLA window",
    Icon: CheckCircle2,
    colors: integrationHealthStatusColors.healthy,
  },
  {
    label: "Degraded",
    detail: "Partial sync · retry queue · operator action recommended",
    Icon: AlertTriangle,
    colors: integrationHealthStatusColors.degraded,
  },
  {
    label: "Skipped / Action required",
    detail: "Partner credentials missing · smoke not run · we say SKIPPED — not fake green",
    Icon: XCircle,
    colors: integrationHealthStatusColors.actionRequired,
  },
] as const;

const MOAT_POINTS = [
  "Every channel shows PASS, SKIPPED, or FAILED — not a blanket “connected” badge.",
  "Recovery playbooks linked from Today Command Center when webhooks fail.",
  "BETA / Preview labels match feature maturity matrix — sales cannot oversell in demo.",
  "Incumbents assume integrations work; we prove it before you bet your rush hour on us.",
] as const;

/** Landing-page Integration Health moat — honest pre-LIVE positioning (MKT-06). */
export function LandingIntegrationHealthMoat() {
  const maturityCounts = countSyncHealthMarketingMaturity();

  return (
    <section
      className="section reveal"
      aria-labelledby="integration-health-moat-heading"
      data-testid={INTEGRATION_HEALTH_CENTER_HERO_P1_22_TEST_ID}
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-16)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-info) 6%, transparent) 0%, var(--color-bg) 100%)",
      }}
    >
      <div className="container">
        <div className="section-header" style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto" }}>
          <span className="section-label">Main differentiator</span>
          <h2 id="integration-health-moat-heading" style={{ marginTop: "var(--space-3)" }}>
            Integration Health Center — honesty before rush hour
          </h2>
          <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-base)", color: "var(--color-text-secondary)" }}>
            Toast and Square assume their marketplaces are live. OS Kitchen shows what is actually
            connected in your workspace — including channels still BETA or SKIPPED — so operators and
            sales never discover a broken webhook mid-service.
          </p>
        </div>

        <div
          data-testid={INTEGRATION_HEALTH_CENTER_HERO_P1_22_COUNTER_TEST_ID}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "var(--space-4)",
            marginTop: "var(--space-10)",
          }}
        >
          {[
            { label: "LIVE integrations", value: maturityCounts.live, tone: "var(--color-success)" },
            { label: "BETA channels", value: maturityCounts.beta, tone: "var(--color-warning)" },
            { label: "SKIPPED (honest)", value: maturityCounts.skipped, tone: "var(--color-text-muted)" },
            { label: "Channels tracked", value: maturityCounts.total, tone: "var(--color-accent)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card"
              style={{
                minWidth: "140px",
                padding: "var(--space-4) var(--space-6)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-3xl)",
                  fontWeight: 800,
                  color: stat.tone,
                }}
              >
                {stat.value}
              </p>
              <p style={{ marginTop: "0.25rem", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div
          className="reveal"
          style={{
            marginTop: "var(--space-12)",
            padding: "var(--space-6)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid color-mix(in srgb, var(--color-border) 80%, transparent)",
            background: "var(--color-bg)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div style={{ marginBottom: "var(--space-4)" }}>
            <p style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>Integration Health dashboard</p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Illustrative sync health — your workspace reflects live webhook and credential checks.
            </p>
          </div>
          <SyncHealthDashboardMarketing compact showHeader={false} />
        </div>

        <div
          className="grid-2 reveal"
          style={{ marginTop: "var(--space-12)", alignItems: "stretch", gap: "var(--space-8)" }}
        >
          <div
            className="card"
            style={{
              padding: "var(--space-8)",
              borderColor: "color-mix(in srgb, var(--color-info) 25%, transparent)",
              background: "var(--color-bg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "var(--space-6)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-lg)",
                  background: "color-mix(in srgb, var(--color-info) 12%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-hidden
              >
                <Cable style={{ width: "24px", height: "24px", color: "var(--color-accent)" }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: "var(--text-lg)" }}>Integration Health Center</p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                  Today · Launch Wizard · Settings
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {STATUS_ROWS.map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    padding: "0.875rem 1rem",
                    borderRadius: "var(--radius-md)",
                    background: row.colors.background,
                    border: `1px solid ${row.colors.border}`,
                  }}
                >
                  <row.Icon
                    style={{ width: "20px", height: "20px", flexShrink: 0, color: row.colors.icon }}
                    aria-hidden
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{row.label}</p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                      {row.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p
              style={{
                marginTop: "var(--space-6)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
              }}
            >
              Illustrative states — your workspace reflects real webhook and credential checks, not
              marketing defaults.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {MOAT_POINTS.map((point) => (
                <li
                  key={point}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <span style={{ color: "var(--color-accent)", fontWeight: 700 }} aria-hidden>
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div
              className="card"
              style={{
                padding: "var(--space-6)",
                background: "var(--color-bg-secondary)",
                borderStyle: "dashed",
              }}
            >
              <p style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Why this matters vs incumbents</p>
              <p style={{ marginTop: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                A green “Uber Eats connected” tile that hides missing partner credentials costs you
                orders. Our moat is operational truth — the same surface powers GO/NO-GO pilot gates
                and owner daily briefing blockers.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <Link href={INTEGRATION_HEALTH_CENTER_HERO_P1_22_IHC_ROUTE} className="btn btn-primary">
                Integration Health Center
              </Link>
              <Link href="/integrations" className="btn btn-secondary">
                See integration matrix
              </Link>
              <Link href="/trust" className="btn btn-secondary">
                BETA / SKIPPED explained
              </Link>
            </div>
          </div>
        </div>

        <IntegrationHealthMarketingExplainerSection variant="compact" className="border-t-0" />
      </div>
    </section>
  );
}
