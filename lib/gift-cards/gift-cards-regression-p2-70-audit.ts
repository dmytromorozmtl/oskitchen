import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildGiftCardRegressionCorpusP270 } from "@/lib/gift-cards/gift-cards-regression-p2-70-corpus";
import {
  GIFT_CARDS_REGRESSION_P2_70_ARTIFACT,
  GIFT_CARDS_REGRESSION_P2_70_DASHBOARD_PAGE,
  GIFT_CARDS_REGRESSION_P2_70_FLOW_MODULE,
  GIFT_CARDS_REGRESSION_P2_70_GIFT_CARD_SERVICE,
  GIFT_CARDS_REGRESSION_P2_70_ISSUE_FORM,
  GIFT_CARDS_REGRESSION_P2_70_POLICY_ID,
  GIFT_CARDS_REGRESSION_P2_70_POS_CHECKOUT_SERVICE,
  GIFT_CARDS_REGRESSION_P2_70_SCENARIO_COUNT,
  GIFT_CARDS_REGRESSION_P2_70_WIRING_PATHS,
} from "@/lib/gift-cards/gift-cards-regression-p2-70-policy";
import { runGiftCardRegressionBenchmarkP270 } from "@/lib/gift-cards/gift-cards-regression-p2-70-scoring";

export type GiftCardsRegressionP270AuditSummary = {
  policyId: typeof GIFT_CARDS_REGRESSION_P2_70_POLICY_ID;
  wiringComplete: boolean;
  flowWired: boolean;
  giftCardServiceWired: boolean;
  posCheckoutWired: boolean;
  dashboardWired: boolean;
  issueFormWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditGiftCardsRegressionP270(
  root = process.cwd(),
): GiftCardsRegressionP270AuditSummary {
  const wiringComplete = GIFT_CARDS_REGRESSION_P2_70_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let flowWired = false;
  if (existsSync(join(root, GIFT_CARDS_REGRESSION_P2_70_FLOW_MODULE))) {
    const source = readFileSync(join(root, GIFT_CARDS_REGRESSION_P2_70_FLOW_MODULE), "utf8");
    flowWired =
      source.includes("issueGiftCardSim") &&
      source.includes("redeemGiftCardSim") &&
      source.includes("PARTIALLY_REDEEMED");
  }

  let giftCardServiceWired = false;
  if (existsSync(join(root, GIFT_CARDS_REGRESSION_P2_70_GIFT_CARD_SERVICE))) {
    const source = readFileSync(join(root, GIFT_CARDS_REGRESSION_P2_70_GIFT_CARD_SERVICE), "utf8");
    giftCardServiceWired =
      source.includes("createGiftCard") &&
      source.includes("lookupGiftCard") &&
      source.includes("redeemGiftCard");
  }

  let posCheckoutWired = false;
  if (existsSync(join(root, GIFT_CARDS_REGRESSION_P2_70_POS_CHECKOUT_SERVICE))) {
    const source = readFileSync(join(root, GIFT_CARDS_REGRESSION_P2_70_POS_CHECKOUT_SERVICE), "utf8");
    posCheckoutWired =
      source.includes("redeemGiftCard") && source.includes("giftCardCode");
  }

  let dashboardWired = false;
  if (existsSync(join(root, GIFT_CARDS_REGRESSION_P2_70_DASHBOARD_PAGE))) {
    const source = readFileSync(join(root, GIFT_CARDS_REGRESSION_P2_70_DASHBOARD_PAGE), "utf8");
    dashboardWired =
      source.includes("partial redemption") && source.includes("GiftCardIssueForm");
  }

  let issueFormWired = false;
  if (existsSync(join(root, GIFT_CARDS_REGRESSION_P2_70_ISSUE_FORM))) {
    const source = readFileSync(join(root, GIFT_CARDS_REGRESSION_P2_70_ISSUE_FORM), "utf8");
    issueFormWired = source.includes("createGiftCardAction");
  }

  const corpus = buildGiftCardRegressionCorpusP270();
  const result = runGiftCardRegressionBenchmarkP270(corpus);
  const artifactPresent = existsSync(join(root, GIFT_CARDS_REGRESSION_P2_70_ARTIFACT));

  const passed =
    wiringComplete &&
    flowWired &&
    giftCardServiceWired &&
    posCheckoutWired &&
    dashboardWired &&
    issueFormWired &&
    corpus.length === GIFT_CARDS_REGRESSION_P2_70_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: GIFT_CARDS_REGRESSION_P2_70_POLICY_ID,
    wiringComplete,
    flowWired,
    giftCardServiceWired,
    posCheckoutWired,
    dashboardWired,
    issueFormWired,
    corpusLoaded: corpus.length === GIFT_CARDS_REGRESSION_P2_70_SCENARIO_COUNT,
    scoringPassed: result.passed,
    passPct: result.passPct,
    artifactPresent,
    passed,
  };
}

export function formatGiftCardsRegressionP270AuditLines(
  summary: GiftCardsRegressionP270AuditSummary,
): string[] {
  return [
    `Gift cards regression (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Flow simulator: ${summary.flowWired ? "wired" : "missing"}`,
    `Gift card service: ${summary.giftCardServiceWired ? "wired" : "missing"}`,
    `POS checkout: ${summary.posCheckoutWired ? "wired" : "missing"}`,
    `Dashboard page: ${summary.dashboardWired ? "yes" : "no"}`,
    `Issue form: ${summary.issueFormWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${GIFT_CARDS_REGRESSION_P2_70_SCENARIO_COUNT} scenarios)`,
    `Regression pass rate: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
