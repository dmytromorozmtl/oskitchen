import { randomUUID } from "crypto";

import { expect, test, type Page } from "@playwright/test";

import {
  CRM_LOYALTY_POINTS_TEST_ID,
  CRM_UNIFIED_PROFILE_PATH,
  LOYALTY_BALANCE_TEST_ID,
  LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS,
  LOYALTY_EARN_REDEEM_E2E_REDEEM_POINTS,
  LOYALTY_EARN_REDEEM_E2E_VISIBLE_MS,
  LOYALTY_REDEEM_INPUT_TEST_ID,
  type LoyaltyEarnRedeemE2EFlowStep,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-policy";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  getLoyaltyBalance,
  updateLoyaltyProgram,
} from "@/services/loyalty/loyalty-service";

import {
  completePosCashSale,
  ensureOpenShift,
  preparePosTerminal,
} from "./pos-checkout-shift-flow";

export type LoyaltyEarnRedeemE2EFlowResult = {
  customerId: string;
  balanceAfterEarn: number;
  balanceAfterRedeem: number;
  steps: LoyaltyEarnRedeemE2EFlowStep[];
};

async function resolveAuthedUserId(): Promise<string | null> {
  const email = process.env.E2E_LOGIN_EMAIL?.trim().toLowerCase();
  if (!email) return null;
  const profile = await prisma.userProfile.findFirst({
    where: { email },
    select: { id: true },
  });
  return profile?.id ?? null;
}

async function ensureLoyaltyProgramForE2E(ownerUserId: string): Promise<void> {
  await updateLoyaltyProgram(ownerUserId, {
    active: true,
    pointsPerDollar: 10,
    redeemPointsThreshold: LOYALTY_EARN_REDEEM_E2E_REDEEM_POINTS,
    redeemValueCents: 500,
  });
}

async function seedE2ELoyaltyCustomer(ownerUserId: string): Promise<{
  id: string;
  email: string;
  label: string;
}> {
  const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
  const stamp = randomUUID().slice(0, 8);
  const email = `e2e-loyalty-${stamp}@example.com`;
  const label = `E2E Loyalty ${stamp}`;

  const customer = await prisma.kitchenCustomer.create({
    data: {
      userId: ownerUserId,
      workspaceId,
      email,
      name: label,
      displayName: label,
    },
    select: { id: true, email: true, displayName: true },
  });

  return {
    id: customer.id,
    email: customer.email,
    label: customer.displayName ?? label,
  };
}

async function attachPosCustomer(page: Page, customerId: string, email: string): Promise<void> {
  const query = email.split("@")[0] ?? email;
  await page.getByTestId("pos-customer-query").fill(query);
  const selectButton = page.getByTestId(`pos-customer-select-${customerId}`);
  await expect(selectButton).toBeVisible({ timeout: LOYALTY_EARN_REDEEM_E2E_VISIBLE_MS });
  await selectButton.click();
  await expect(page.getByTestId(LOYALTY_BALANCE_TEST_ID)).toBeVisible({
    timeout: LOYALTY_EARN_REDEEM_E2E_VISIBLE_MS,
  });
}

export async function runLoyaltyEarnRedeemE2EFlow(
  page: Page,
): Promise<LoyaltyEarnRedeemE2EFlowResult> {
  const steps: LoyaltyEarnRedeemE2EFlowStep[] = [];

  const ownerUserId = await resolveAuthedUserId();
  if (!ownerUserId) {
    test.skip(true, "E2E_LOGIN_EMAIL user not found in database.");
  }

  await ensureLoyaltyProgramForE2E(ownerUserId);
  const customer = await seedE2ELoyaltyCustomer(ownerUserId);
  steps.push("seed_customer");

  await ensureOpenShift(page);
  await preparePosTerminal(page);

  await attachPosCustomer(page, customer.id, customer.email);
  await completePosCashSale(page);
  steps.push("place_order_earn");

  const balanceAfterEarn = await getLoyaltyBalance(ownerUserId, customer.id);
  expect(balanceAfterEarn).toBeGreaterThanOrEqual(LOYALTY_EARN_REDEEM_E2E_REDEEM_POINTS);

  await page.goto(`${CRM_UNIFIED_PROFILE_PATH}/${customer.id}`);
  await expect(page.getByTestId("unified-customer-profile-panel")).toBeVisible({
    timeout: LOYALTY_EARN_REDEEM_E2E_VISIBLE_MS,
  });
  await expect(page.getByTestId(CRM_LOYALTY_POINTS_TEST_ID)).toContainText(
    String(balanceAfterEarn),
    { timeout: LOYALTY_EARN_REDEEM_E2E_VISIBLE_MS },
  );
  steps.push("verify_crm_points");

  await page.goto("/dashboard/pos/terminal");
  await preparePosTerminal(page);
  await attachPosCustomer(page, customer.id, customer.email);

  await expect(page.getByTestId(LOYALTY_BALANCE_TEST_ID)).toContainText(
    String(balanceAfterEarn),
    { timeout: LOYALTY_EARN_REDEEM_E2E_VISIBLE_MS },
  );

  await page.getByTestId(LOYALTY_REDEEM_INPUT_TEST_ID).fill(
    String(LOYALTY_EARN_REDEEM_E2E_REDEEM_POINTS),
  );
  await completePosCashSale(page);
  steps.push("redeem_next_order");

  const balanceAfterRedeem = await getLoyaltyBalance(ownerUserId, customer.id);
  expect(balanceAfterRedeem).toBeLessThan(balanceAfterEarn);
  steps.push("verify_balance_updated");

  return {
    customerId: customer.id,
    balanceAfterEarn,
    balanceAfterRedeem,
    steps,
  };
}
