import { QR_ORDERING_E2E_P2_74_SCENARIO_COUNT } from "@/lib/qr/qr-ordering-e2e-p2-74-policy";
import {
  runQrOrderingE2EChain,
  simulateQrCheckout,
  simulateQrScan,
  type QrOrderChainSim,
} from "@/lib/qr/qr-ordering-e2e-p2-74-flow";

export type QrOrderingE2EScenarioP274 = {
  id: string;
  label: string;
  run: () => { passed: boolean; message?: string };
};

function scenario(
  id: string,
  label: string,
  run: () => { passed: boolean; message?: string },
): QrOrderingE2EScenarioP274 {
  return { id, label, run };
}

export function buildQrOrderingE2ECorpusP274(): QrOrderingE2EScenarioP274[] {
  return [
    scenario("qr-01-full-chain", "Full chain: scan → checkout → webhook → KDS", () => {
      const result = runQrOrderingE2EChain("demo-store", "12", 2);
      if (!result.ok) return { passed: false, message: result.error };
      if (!result.chain.kdsVisible || !result.chain.kitchenTaskId) {
        return { passed: false, message: "KDS ticket not visible" };
      }
      return { passed: true };
    }),
    scenario("qr-02-empty-cart-blocked", "Empty cart blocked at checkout", () => {
      const scan = simulateQrScan("demo-store", "12");
      if (!scan.ok) return { passed: false, message: scan.error };
      const checkout = simulateQrCheckout(scan.chain, 0);
      if (checkout.ok) return { passed: false, message: "Expected empty cart error" };
      return { passed: true };
    }),
    scenario("qr-03-table-encoding", "Table route id encoding in scan path", () => {
      const result = simulateQrScan("demo-store", "Table 1");
      if (!result.ok) return { passed: false, message: result.error };
      if (!result.chain.scanPath?.includes("Table%201")) {
        return { passed: false, message: "Table route not encoded in path" };
      }
      return { passed: true };
    }),
    scenario("qr-04-multi-item-order", "Multi-item order reaches KDS", () => {
      const result = runQrOrderingE2EChain("demo-store", "5", 4);
      if (!result.ok) return { passed: false, message: result.error };
      if (result.chain.lineCount !== 4) {
        return { passed: false, message: "Line count mismatch" };
      }
      return { passed: true };
    }),
    scenario("qr-05-webhook-linked", "Webhook event linked to order", () => {
      const result = runQrOrderingE2EChain("bistro", "8", 1);
      if (!result.ok) return { passed: false, message: result.error };
      if (!result.chain.webhookEventId?.startsWith("wh-")) {
        return { passed: false, message: "Webhook event id missing" };
      }
      return { passed: true };
    }),
    scenario("qr-06-kitchen-task-source", "KitchenTask linked after webhook", () => {
      const result = runQrOrderingE2EChain("cafe", "3", 2);
      if (!result.ok) return { passed: false, message: result.error };
      const taskId = result.chain.kitchenTaskId;
      if (!taskId?.startsWith("kt-")) {
        return { passed: false, message: "KitchenTask id missing" };
      }
      return { passed: true };
    }),
  ];
}

export type QrOrderingE2EBenchmarkP274Result = {
  scenarioCount: number;
  passedCount: number;
  passPct: number;
  passed: boolean;
  scenarioScores: Array<{ scenarioId: string; passed: boolean; message?: string }>;
};

export function runQrOrderingE2EBenchmarkP274(
  scenarios: QrOrderingE2EScenarioP274[] = buildQrOrderingE2ECorpusP274(),
): QrOrderingE2EBenchmarkP274Result {
  const scenarioScores = scenarios.map((scenarioItem) => {
    const outcome = scenarioItem.run();
    return {
      scenarioId: scenarioItem.id,
      passed: outcome.passed,
      message: outcome.message,
    };
  });
  const passedCount = scenarioScores.filter((score) => score.passed).length;
  const passPct =
    scenarios.length === 0 ? 0 : Math.round((passedCount / scenarios.length) * 100);

  return {
    scenarioCount: scenarios.length,
    passedCount,
    passPct,
    passed:
      scenarios.length === QR_ORDERING_E2E_P2_74_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}

export function buildDegradedQrOrderingE2EP274Scenarios(
  scenarios: QrOrderingE2EScenarioP274[] = buildQrOrderingE2ECorpusP274(),
): QrOrderingE2EScenarioP274[] {
  return scenarios.map((scenarioItem, index) =>
    index === 0
      ? {
          ...scenarioItem,
          run: () => ({ passed: false, message: "Degraded scenario" }),
        }
      : scenarioItem,
  );
}

export type { QrOrderChainSim };
