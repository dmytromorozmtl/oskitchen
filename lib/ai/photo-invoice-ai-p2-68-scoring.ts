import {
  PHOTO_INVOICE_AI_P2_68_DOCUMENT_CAPABILITIES,
  PHOTO_INVOICE_AI_P2_68_MIN_CAPABILITY_COVERAGE_PCT,
  PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT,
  type PhotoInvoiceDocumentCapability,
} from "@/lib/ai/photo-invoice-ai-p2-68-policy";
import {
  buildSupplierDocumentFromScannedInvoice,
  countLowConfidenceLines,
  isSupplierDocumentReadyForCreation,
} from "@/lib/ai/photo-invoice-ai-p2-68-builder";
import {
  buildPhotoInvoiceAiCorpusP268,
  type PhotoInvoiceAiScenarioP268,
} from "@/lib/ai/photo-invoice-ai-p2-68-corpus";

export type PhotoInvoiceAiScenarioScoreP268 = {
  scenarioId: string;
  documentReady: boolean;
  expectedDocument: boolean;
  passed: boolean;
};

export type PhotoInvoiceAiBenchmarkP268Result = {
  scenarioCount: number;
  capabilityCoveragePct: number;
  passed: boolean;
  thresholdPct: number;
  uncoveredCapabilities: PhotoInvoiceDocumentCapability[];
  scenarioScores: PhotoInvoiceAiScenarioScoreP268[];
};

function scoreScenario(scenario: PhotoInvoiceAiScenarioP268): PhotoInvoiceAiScenarioScoreP268 {
  const draft = buildSupplierDocumentFromScannedInvoice(scenario.input);
  const documentReady = isSupplierDocumentReadyForCreation(draft);

  let passed = documentReady === scenario.expectsDocument;

  if (documentReady && draft.lineItems.length < scenario.minLineItems) {
    passed = false;
  }

  if (scenario.capabilities.includes("receipt_image_attachment") && scenario.input.imageUrl) {
    if (draft.receiptImageUrl !== scenario.input.imageUrl) passed = false;
  }

  if (scenario.capabilities.includes("pending_status")) {
    if (draft.documentStatus !== "PENDING") passed = false;
  }

  if (scenario.capabilities.includes("confidence_review") && documentReady) {
    if (countLowConfidenceLines(draft) === 0) passed = false;
  }

  if (scenario.capabilities.includes("supplier_resolution") && scenario.input.supplier === "") {
    if (draft.supplierName !== "Unknown Vendor") passed = false;
  }

  return {
    scenarioId: scenario.id,
    documentReady,
    expectedDocument: scenario.expectsDocument,
    passed,
  };
}

export function runPhotoInvoiceAiBenchmarkP268(
  scenarios: PhotoInvoiceAiScenarioP268[] = buildPhotoInvoiceAiCorpusP268(),
): PhotoInvoiceAiBenchmarkP268Result {
  const covered = new Set<PhotoInvoiceDocumentCapability>();
  for (const scenario of scenarios) {
    for (const capability of scenario.capabilities) {
      covered.add(capability);
    }
  }

  const uncoveredCapabilities = PHOTO_INVOICE_AI_P2_68_DOCUMENT_CAPABILITIES.filter(
    (c) => !covered.has(c),
  );

  const total = PHOTO_INVOICE_AI_P2_68_DOCUMENT_CAPABILITIES.length;
  const capabilityCoveragePct =
    total === 0 ? 0 : Math.round((covered.size / total) * 100);

  const scenarioScores = scenarios.map(scoreScenario);
  const allScenariosPassed = scenarioScores.every((s) => s.passed);

  const passed =
    scenarios.length === PHOTO_INVOICE_AI_P2_68_SCENARIO_COUNT &&
    capabilityCoveragePct >= PHOTO_INVOICE_AI_P2_68_MIN_CAPABILITY_COVERAGE_PCT &&
    uncoveredCapabilities.length === 0 &&
    allScenariosPassed;

  return {
    scenarioCount: scenarios.length,
    capabilityCoveragePct,
    passed,
    thresholdPct: PHOTO_INVOICE_AI_P2_68_MIN_CAPABILITY_COVERAGE_PCT,
    uncoveredCapabilities,
    scenarioScores,
  };
}

export function buildDegradedPhotoInvoiceAiP268Scenarios(): PhotoInvoiceAiScenarioP268[] {
  return buildPhotoInvoiceAiCorpusP268().slice(0, 3);
}
