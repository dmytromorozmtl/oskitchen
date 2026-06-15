import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateProductionHardeningGate,
  isProductionHardeningGateEnabled,
  readProductionHardening,
} from "@/lib/experiment-production/production-hardening-gate";
import { experimentCryptoBackend, isProductionCryptoBackend } from "@/lib/experiment-production/crypto-backend";
import { evaluateStrictEnvGate } from "@/lib/experiment-production/strict-env-validator";

export function ProductionHardeningCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const gate = evaluateProductionHardeningGate(themeExperimentJson ?? null);
  const strict = evaluateStrictEnvGate();
  const snap = themeExperimentJson ? readProductionHardening(themeExperimentJson) : null;

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Production hardening (AB+)</CardTitle>
        <CardDescription>
          Layer D: prod crypto backends, strict env chains, workspace peer discovery.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isProductionHardeningGateEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isProductionHardeningGateEnabled()
            ? "Production hardening gate enabled"
            : "Set THEME_EXPERIMENT_PRODUCTION_HARDENING=1"}
        </p>
        <p>
          Crypto backend:{" "}
          <span className="font-mono">{experimentCryptoBackend()}</span>
          {isProductionCryptoBackend() ? " (Circom/SEAL/liboqs)" : " (sim)"}
        </p>
        <p className={strict.passed ? "text-emerald-700" : "text-amber-700"}>
          Strict env: {strict.headline}
        </p>
        {!strict.passed && strict.detail ? (
          <p className="text-muted-foreground text-xs">{strict.detail}</p>
        ) : null}
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            snapshot: zk={snap.zkBackend} pqc={snap.pqcBackend} strict={snap.strictEnvPassed ? "ok" : "no"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">npm run ops:phase-ab-prod-wiring</p>
      </CardContent>
    </Card>
  );
}
