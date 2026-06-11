import { LoyaltyRulesForm } from "@/components/customers/loyalty-rules-form";
import { LoyaltyTransactionHistory } from "@/components/customers/loyalty-transaction-history";
import { RestaurantLoyaltyConfigForm } from "@/components/customers/restaurant-loyalty-config-form";
import { PolicyLockedHonestyBanner } from "@/components/dashboard/policy-locked-honesty-banner";
import { requireLoyaltyPageAccess } from "@/lib/crm/rewards-page-access";
import { restaurantLoyaltyFromSettingsCenter } from "@/lib/loyalty/restaurant-loyalty-settings";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import {
  getLoyaltyTransactions,
  getOrCreateLoyaltyProgram,
  listLoyaltyAccounts,
} from "@/services/loyalty/loyalty-service";

export const dynamic = "force-dynamic";

export default async function CustomerLoyaltyPage() {
  const access = await requireLoyaltyPageAccess();
  if (!access.ok) return access.deny;

  const { userId } = await getTenantActor();
  const [program, accounts, transactions, kitchen] = await Promise.all([
    getOrCreateLoyaltyProgram(userId),
    listLoyaltyAccounts(userId),
    getLoyaltyTransactions(userId, 50),
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { settingsCenterJson: true },
    }),
  ]);

  const restaurantConfig = restaurantLoyaltyFromSettingsCenter(kitchen?.settingsCenterJson);

  const txRows = transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    points: tx.points,
    notes: tx.notes,
    createdAt: tx.createdAt,
    customerLabel:
      tx.account.customer.displayName ??
      tx.account.customer.name ??
      tx.account.customer.email ??
      "Member",
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PolicyLockedHonestyBanner variant="rewards_dual_ledger" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Loyalty program</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kitchen-ledger loyalty for POS — per-item bonuses, visit rewards, and tier multipliers.
            Storefront uses a separate ledger until unified rewards ship.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <a
            href="/dashboard/loyalty/loyalty-3"
            className="font-medium text-primary underline underline-offset-4"
          >
            Open Loyalty 3.0 →
          </a>
          <a
            href="/dashboard/loyalty/program-builder"
            className="text-muted-foreground underline underline-offset-4"
          >
            Loyalty 2.0 builder
          </a>
        </div>
      </div>

      {access.canManage ? (
        <>
          <LoyaltyRulesForm
            program={{
              pointsPerDollar: Number(program.pointsPerDollar),
              redeemPointsThreshold: program.redeemPointsThreshold,
              redeemValueCents: program.redeemValueCents,
              active: program.active,
            }}
          />
          <RestaurantLoyaltyConfigForm config={restaurantConfig} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          You can view loyalty activity but do not have permission to change program rules.
        </p>
      )}

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">Member accounts</h2>
        {accounts.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No loyalty accounts yet — link a customer on POS or storefront checkout.
          </p>
        ) : (
          <ul className="mt-3 divide-y text-sm">
            {accounts.map((a) => (
              <li key={a.id} className="flex justify-between py-2">
                <span>{a.customer.displayName ?? a.customer.name ?? a.customer.email}</span>
                <span className="font-medium">
                  {a.pointsBalance} pts · {a.tier}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LoyaltyTransactionHistory transactions={txRows} />
    </div>
  );
}
