import {
  AI_MOATS_HONEST_POSITIONING_POLICY_ID,
  auditAiMoatsHonestPositioningPage,
} from "@/lib/marketing/ai-moats-honest-positioning-policy";
import {
  auditCaseStudyTemplateDoc,
  CASE_STUDY_TEMPLATE_POLICY_ID,
} from "@/lib/marketing/case-study-template-policy";
import {
  auditCompetitiveBattleCardsDoc,
  COMPETITIVE_BATTLE_CARDS_POLICY_ID,
} from "@/lib/marketing/competitive-battle-cards-policy";
import {
  auditDemoScript15MinDoc,
  DEMO_SCRIPT_15MIN_POLICY_ID,
} from "@/lib/marketing/demo-script-15min-policy";
import {
  auditDemoVideo5MinDoc,
  DEMO_VIDEO_5MIN_POLICY_ID,
} from "@/lib/marketing/demo-video-script-5min-policy";
import {
  auditDiscoveryCallScriptDoc,
  DISCOVERY_CALL_SCRIPT_POLICY_ID,
} from "@/lib/marketing/discovery-call-script-policy";
import {
  auditEmailNurture5SequenceDoc,
  EMAIL_NURTURE_5_SEQUENCE_POLICY_ID,
} from "@/lib/marketing/email-nurture-5-sequence-policy";
import {
  auditIntegrationHonestyScreenShareDoc,
  INTEGRATION_HONESTY_SCREEN_SHARE_POLICY_ID,
} from "@/lib/marketing/integration-honesty-screen-share-policy";
import {
  auditLoiTemplateWalkthroughDoc,
  LOI_TEMPLATE_WALKTHROUGH_POLICY_ID,
} from "@/lib/marketing/loi-template-walkthrough-policy";
import {
  auditMarketplaceB2bSupplyAngleDoc,
  MARKETPLACE_B2B_SUPPLY_ANGLE_POLICY_ID,
} from "@/lib/marketing/marketplace-b2b-supply-angle-policy";
import {
  MARKETING_P1_STABILIZATION_PATTERNS_POLICY_ID,
  MARKETING_P1_STABILIZATION_SUB_POLICIES,
} from "@/lib/marketing/marketing-p1-stabilization-patterns";
import {
  auditObjectionHandlingDoc,
  OBJECTION_HANDLING_POLICY_ID,
} from "@/lib/marketing/objection-handling-policy";
import {
  auditPilotProposalTemplateDoc,
  PILOT_PROPOSAL_TEMPLATE_POLICY_ID,
} from "@/lib/marketing/pilot-proposal-template-policy";
import {
  auditProfitEngineOwnerMarginStoryDoc,
  PROFIT_ENGINE_OWNER_MARGIN_STORY_POLICY_ID,
} from "@/lib/marketing/profit-engine-owner-margin-story-policy";
import {
  auditQrOrderingPilotStoryDoc,
  QR_ORDERING_PILOT_STORY_POLICY_ID,
} from "@/lib/marketing/qr-ordering-pilot-story-policy";
import {
  auditRoiCalculatorConservativeDoc,
  ROI_CALCULATOR_CONSERVATIVE_POLICY_ID,
} from "@/lib/marketing/roi-calculator-conservative-policy";
import {
  auditSeo10IcpKeywordsDoc,
  SEO_10_ICP_KEYWORDS_POLICY_ID,
} from "@/lib/marketing/seo-10-icp-keywords-policy";
import {
  auditShopifyBundleGtmLanding,
  SHOPIFY_BUNDLE_GTM_POLICY_ID,
} from "@/lib/marketing/shopify-bundle-gtm-policy";
import {
  auditWebinarGhostKitchensDoc,
  WEBINAR_GHOST_KITCHENS_POLICY_ID,
} from "@/lib/marketing/webinar-ghost-kitchens-policy";

/**
 * MKT-37 — capstone audit composing MKT-11 through MKT-28 P1 marketing policies.
 */

export const MARKETING_P1_STABILIZATION_AUDIT_POLICY_ID =
  MARKETING_P1_STABILIZATION_PATTERNS_POLICY_ID;

export type MarketingP1StabilizationSubAuditResult = {
  taskId: string;
  policyId: string;
  passed: boolean;
};

export type MarketingP1StabilizationAuditReport = {
  policyId: typeof MARKETING_P1_STABILIZATION_AUDIT_POLICY_ID;
  subAudits: MarketingP1StabilizationSubAuditResult[];
  passed: boolean;
};

const SUB_AUDIT_RUNNERS: Record<
  string,
  () => { policyId: string; passed: boolean }
> = {
  "MKT-11": () => ({
    policyId: CASE_STUDY_TEMPLATE_POLICY_ID,
    passed: auditCaseStudyTemplateDoc().passed,
  }),
  "MKT-12": () => ({
    policyId: DEMO_VIDEO_5MIN_POLICY_ID,
    passed: auditDemoVideo5MinDoc().passed,
  }),
  "MKT-13": () => ({
    policyId: SHOPIFY_BUNDLE_GTM_POLICY_ID,
    passed: auditShopifyBundleGtmLanding().passed,
  }),
  "MKT-14": () => ({
    policyId: QR_ORDERING_PILOT_STORY_POLICY_ID,
    passed: auditQrOrderingPilotStoryDoc().passed,
  }),
  "MKT-15": () => ({
    policyId: PROFIT_ENGINE_OWNER_MARGIN_STORY_POLICY_ID,
    passed: auditProfitEngineOwnerMarginStoryDoc().passed,
  }),
  "MKT-16": () => ({
    policyId: MARKETPLACE_B2B_SUPPLY_ANGLE_POLICY_ID,
    passed: auditMarketplaceB2bSupplyAngleDoc().passed,
  }),
  "MKT-17": () => ({
    policyId: AI_MOATS_HONEST_POSITIONING_POLICY_ID,
    passed: auditAiMoatsHonestPositioningPage().passed,
  }),
  "MKT-18": () => ({
    policyId: WEBINAR_GHOST_KITCHENS_POLICY_ID,
    passed: auditWebinarGhostKitchensDoc().passed,
  }),
  "MKT-19": () => ({
    policyId: EMAIL_NURTURE_5_SEQUENCE_POLICY_ID,
    passed: auditEmailNurture5SequenceDoc().passed,
  }),
  "MKT-20": () => ({
    policyId: SEO_10_ICP_KEYWORDS_POLICY_ID,
    passed: auditSeo10IcpKeywordsDoc().passed,
  }),
  "MKT-21": () => ({
    policyId: DISCOVERY_CALL_SCRIPT_POLICY_ID,
    passed: auditDiscoveryCallScriptDoc().passed,
  }),
  "MKT-22": () => ({
    policyId: DEMO_SCRIPT_15MIN_POLICY_ID,
    passed: auditDemoScript15MinDoc().passed,
  }),
  "MKT-23": () => ({
    policyId: OBJECTION_HANDLING_POLICY_ID,
    passed: auditObjectionHandlingDoc().passed,
  }),
  "MKT-24": () => ({
    policyId: PILOT_PROPOSAL_TEMPLATE_POLICY_ID,
    passed: auditPilotProposalTemplateDoc().passed,
  }),
  "MKT-25": () => ({
    policyId: ROI_CALCULATOR_CONSERVATIVE_POLICY_ID,
    passed: auditRoiCalculatorConservativeDoc().passed,
  }),
  "MKT-26": () => ({
    policyId: COMPETITIVE_BATTLE_CARDS_POLICY_ID,
    passed: auditCompetitiveBattleCardsDoc().passed,
  }),
  "MKT-27": () => ({
    policyId: INTEGRATION_HONESTY_SCREEN_SHARE_POLICY_ID,
    passed: auditIntegrationHonestyScreenShareDoc().passed,
  }),
  "MKT-28": () => ({
    policyId: LOI_TEMPLATE_WALKTHROUGH_POLICY_ID,
    passed: auditLoiTemplateWalkthroughDoc().passed,
  }),
};

export function auditMarketingP1Stabilization(
  root?: string,
): MarketingP1StabilizationAuditReport {
  void root;
  const subAudits = MARKETING_P1_STABILIZATION_SUB_POLICIES.map((entry) => {
    const report = SUB_AUDIT_RUNNERS[entry.id]!();
    return {
      taskId: entry.id,
      policyId: report.policyId,
      passed: report.passed,
    };
  });

  return {
    policyId: MARKETING_P1_STABILIZATION_AUDIT_POLICY_ID,
    subAudits,
    passed: subAudits.every((a) => a.passed),
  };
}
