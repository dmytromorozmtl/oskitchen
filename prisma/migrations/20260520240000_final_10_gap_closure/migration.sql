-- Final 10 gap closure: loyalty, gift cards

CREATE TYPE "LoyaltyTransactionType" AS ENUM ('EARN', 'REDEEM');
CREATE TYPE "GiftCardStatus" AS ENUM ('ACTIVE', 'PARTIALLY_REDEEMED', 'REDEEMED', 'VOID');

CREATE TABLE IF NOT EXISTS "loyalty_programs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "points_per_dollar" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "redeem_points_threshold" INTEGER NOT NULL DEFAULT 100,
    "redeem_value_cents" INTEGER NOT NULL DEFAULT 500,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "loyalty_programs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_programs_user_id_key" ON "loyalty_programs"("user_id");
ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "loyalty_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "points_balance" INTEGER NOT NULL DEFAULT 0,
    "tier" VARCHAR(40) NOT NULL DEFAULT 'STANDARD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "loyalty_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_accounts_customer_id_key" ON "loyalty_accounts"("customer_id");
CREATE INDEX IF NOT EXISTS "loyalty_accounts_user_id_idx" ON "loyalty_accounts"("user_id");
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "kitchen_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "type" "LoyaltyTransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "order_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "loyalty_transactions_account_id_created_at_idx" ON "loyalty_transactions"("account_id", "created_at");
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "gift_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "initial_balance" DECIMAL(12,2) NOT NULL,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchaser_email" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "gift_cards_user_id_code_key" ON "gift_cards"("user_id", "code");
CREATE INDEX IF NOT EXISTS "gift_cards_user_id_status_idx" ON "gift_cards"("user_id", "status");
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
