import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditForbiddenClaimsMarketingPages } from "@/lib/marketing/forbidden-claims-audit";
import {
  EXTERNAL_COMMS_P3_138_APPROVAL_CHAIN,
  EXTERNAL_COMMS_P3_138_CHANNEL_IDS,
  EXTERNAL_COMMS_P3_138_POLICY_ID,
} from "@/lib/pm/external-comms-p3-138-policy";

export type ExternalCommsChannelRecord = {
  id: string;
  label: string;
  proofRequired: boolean;
  approvalRequired: boolean;
  status: string;
};

export type ExternalCommsPolicyPmRegistry = {
  version: string;
  policyId: typeof EXTERNAL_COMMS_P3_138_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  approvalChain: string[];
  proofRule: string;
  pendingCommsCount: number;
  approvedCommsCount: number;
  implementationRefs: Record<string, string>;
  channels: ExternalCommsChannelRecord[];
};

export function loadExternalCommsPolicyPmRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/external-comms-policy-pm-registry.json",
): ExternalCommsPolicyPmRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as ExternalCommsPolicyPmRegistry;
}

export function validateExternalCommsPolicyPmRegistry(
  registry: ExternalCommsPolicyPmRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  approvalChainMatches: boolean;
  channelsComplete: boolean;
  zeroPending: boolean;
} {
  const policyIdMatches = registry.policyId === EXTERNAL_COMMS_P3_138_POLICY_ID;

  const approvalChainMatches =
    registry.approvalChain.length === EXTERNAL_COMMS_P3_138_APPROVAL_CHAIN.length &&
    EXTERNAL_COMMS_P3_138_APPROVAL_CHAIN.every(
      (role, index) => registry.approvalChain[index] === role,
    );

  const channelsComplete =
    registry.channels.length === EXTERNAL_COMMS_P3_138_CHANNEL_IDS.length &&
    EXTERNAL_COMMS_P3_138_CHANNEL_IDS.every((channelId, index) => {
      const channel = registry.channels[index];
      return (
        channel?.id === channelId &&
        channel.proofRequired === true &&
        channel.approvalRequired === true &&
        channel.status === "requires_approval"
      );
    });

  const zeroPending =
    registry.pendingCommsCount === 0 && registry.approvedCommsCount === 0;

  const valid = policyIdMatches && approvalChainMatches && channelsComplete && zeroPending;

  return {
    valid,
    policyIdMatches,
    approvalChainMatches,
    channelsComplete,
    zeroPending,
  };
}

export function checkExternalCommsLiveForbiddenClaimsAudit(root = process.cwd()): boolean {
  const summary = auditForbiddenClaimsMarketingPages(root);
  return summary.passed;
}
