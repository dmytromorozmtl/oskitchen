import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMERCIAL_PILOT_P0_STAGING_ANCHOR } from "@/lib/commercial/commercial-pilot-ops-status-era18-policy";
import {
  COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC,
  type CommercialInflectionReadinessSummary,
} from "@/lib/commercial/commercial-inflection-readiness-era28";
import type { CommercialInflectionReadinessUiSlice } from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import type { P0OpsVaultUiSlice } from "@/lib/commercial/p0-ops-vault-ui-era21";

function statusTone(
  status: string,
): "default" | "destructive" | "secondary" | "outline" {
  if (status === "done") return "default";
  if (status === "blocked" || status === "human_required") return "destructive";
  if (status === "deferred") return "secondary";
  return "outline";
}

export function CommercialInflectionReadinessPanel(props: {
  summary: CommercialInflectionReadinessSummary;
  uiSlice?: CommercialInflectionReadinessUiSlice | null;
  vaultHero?: P0OpsVaultUiSlice | null;
}) {
  const p0Rows = props.summary.blockers.filter((row) => row.priority === "P0");
  const p1Rows = props.summary.blockers.filter((row) => row.priority === "P1");
  const stopRows = props.summary.blockers.filter((row) => row.priority === "STOP");

  return (
    <Card
      id="commercial-inflection-readiness"
      className="scroll-mt-24 border-amber-600/40"
      data-testid="commercial-inflection-readiness-panel"
    >
      <CardHeader>
        <CardTitle className="text-lg">Commercial inflection readiness</CardTitle>
        <CardDescription>
          Governance {props.summary.governanceScore}/100 does not mean market ready — pilot executable{" "}
          {props.summary.pilotExecutableScore}/100. Honest blockers from artifacts + env (never SKIPPED
          as PASS).
          {props.uiSlice?.topBlockerTitle
            ? ` Top blocker: ${props.uiSlice.topBlockerTitle}.`
            : ""}
        </CardDescription>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            {props.summary.milestone.replaceAll("_", " ")}
          </Badge>
          <Badge variant="destructive" className="text-[10px]">
            P0 blocked: {props.summary.blockedP0Count}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            vault missing: {props.summary.p0VaultMissingCount}/11
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {props.summary.milestone === "p0_ops_vault_blocked" &&
        props.vaultHero?.nextPhase &&
        props.vaultHero.nextPhase.missingKeys.length > 0 ? (
          <div
            className="rounded-lg border border-amber-700/50 bg-amber-950/20 px-4 py-3"
            data-testid="commercial-inflection-vault-hero"
          >
            <p className="font-medium text-amber-200">
              Commercial inflection blocked — start {props.vaultHero.nextPhase.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{props.uiSlice?.topBlockerDetail}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {props.vaultHero.nextPhase.missingKeys.join(", ")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {props.vaultHero.nextPhase.docPath} · {props.vaultHero.vaultMatrixDoc}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={COMMERCIAL_PILOT_P0_STAGING_ANCHOR}
                className="text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                Open P0 staging proof panel
              </Link>
              {props.uiSlice?.platformOpsHref ? (
                <Link
                  href={props.uiSlice.platformOpsHref}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Vault ops anchor
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <p className="text-muted-foreground">
          P0 proof: <strong>{props.summary.p0ProofStatus}</strong> · GO:{" "}
          <strong>{props.summary.goDecision ?? "missing"}</strong> · Integration LIVE:{" "}
          {props.summary.integrationRegistryLiveCount} · Channel LIVE:{" "}
          {props.summary.channelRegistryLiveCount}
        </p>

        <div>
          <p className="mb-2 font-medium text-amber-100">P0 — unblock commercial inflection</p>
          <ul className="space-y-2">
            {p0Rows.map((row) => (
              <li
                key={row.id}
                className="rounded-md border border-border/60 px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusTone(row.status)} className="text-[10px]">
                    {row.status.replaceAll("_", " ")}
                  </Badge>
                  <span className="font-medium">{row.title}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{row.detail}</p>
                {row.platformRoute ? (
                  <Link
                    href={row.platformRoute}
                    className="mt-1 inline-block text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Open surface
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        {p1Rows.length > 0 ? (
          <div>
            <p className="mb-2 font-medium text-slate-200">P1 — before pilot scale</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {p1Rows.map((row) => (
                <li key={row.id}>
                  <strong>{row.title}</strong> — {row.status}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="font-mono text-[10px] text-muted-foreground">
          <div>npm run ops:run-commercial-inflection-readiness-orchestrator -- --write</div>
          <div>npm run ops:sync-commercial-inflection-readiness-report -- --write</div>
          <div>npm run ops:run-p0-vault-day0-orchestrator -- --write</div>
        </div>

        {stopRows.length > 0 ? (
          <div>
            <p className="mb-2 font-medium text-rose-200">STOP rules</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {stopRows.map((row) => (
                <li key={row.id}>
                  <strong>{row.title}</strong> — {row.detail}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="font-mono text-[10px] text-muted-foreground">
          {props.summary.recommendedCommands.map((command) => (
            <div key={command}>{command}</div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Full matrix: <code>{COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC}</code>
        </p>
      </CardContent>
    </Card>
  );
}
