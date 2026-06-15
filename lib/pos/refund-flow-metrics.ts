/**
 * Refund flow contract metrics for QA-35 E2E proof.
 */

import {
  type RefundFlowContract,
  refundFlowWithinContract,
} from "@/lib/pos/refund-flow-e2e-policy";

export type RefundFlowSummary = RefundFlowContract & {
  withinContract: boolean;
};

export function summarizeRefundFlowResult(input: RefundFlowContract): RefundFlowSummary {
  return {
    ...input,
    withinContract: refundFlowWithinContract(input),
  };
}

export function refundFlowSucceeded(input: RefundFlowContract): boolean {
  return summarizeRefundFlowResult(input).withinContract;
}
