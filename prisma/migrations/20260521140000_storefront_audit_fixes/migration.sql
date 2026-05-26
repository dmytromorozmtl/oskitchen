-- Storefront audit fixes: cart recovery 72h, gift cards, loyalty, upsells, P2/P3 tables

ALTER TABLE "storefront_cart_recoveries"
  ADD COLUMN IF NOT EXISTS "emailed_72h_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "recovery_discount_percent" INTEGER;

CREATE TABLE IF NOT EXISTS "storefront_gift_cards" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "code" VARCHAR(32) NOT NULL,
  "initial_value" DECIMAL(12,2) NOT NULL,
  "balance" DECIMAL(12,2) NOT NULL,
  "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "purchaser_email" VARCHAR(255),
  "recipient_email" VARCHAR(255),
  "recipient_name" VARCHAR(255),
  "message" TEXT,
  "expires_at" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_gift_cards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_gift_cards_code_key" ON "storefront_gift_cards"("code");
CREATE INDEX IF NOT EXISTS "storefront_gift_cards_user_id_idx" ON "storefront_gift_cards"("user_id");
CREATE INDEX IF NOT EXISTS "storefront_gift_cards_storefront_id_idx" ON "storefront_gift_cards"("storefront_id");

CREATE TABLE IF NOT EXISTS "storefront_gift_card_redemptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "gift_card_id" UUID NOT NULL,
  "order_id" UUID,
  "amount" DECIMAL(12,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_gift_card_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "storefront_gift_card_redemptions_gift_card_id_idx" ON "storefront_gift_card_redemptions"("gift_card_id");

CREATE TABLE IF NOT EXISTS "storefront_upsell_rules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "trigger_product_id" UUID NOT NULL,
  "suggest_product_ids" UUID[] NOT NULL,
  "display_type" VARCHAR(32) NOT NULL DEFAULT 'CART',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_upsell_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "storefront_upsell_rules_storefront_id_idx" ON "storefront_upsell_rules"("storefront_id");

CREATE TABLE IF NOT EXISTS "storefront_loyalty_programs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "points_per_dollar" DECIMAL(8,2) NOT NULL DEFAULT 1,
  "redeem_points" INTEGER NOT NULL DEFAULT 200,
  "redeem_amount" DECIMAL(12,2) NOT NULL DEFAULT 5,
  "min_points_to_redeem" INTEGER NOT NULL DEFAULT 200,
  "expires_in_days" INTEGER,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_loyalty_programs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_loyalty_programs_storefront_id_key" ON "storefront_loyalty_programs"("storefront_id");

CREATE TABLE IF NOT EXISTS "storefront_loyalty_accounts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "customer_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 0,
  "lifetime_points" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_loyalty_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_loyalty_accounts_customer_id_storefront_id_key" ON "storefront_loyalty_accounts"("customer_id", "storefront_id");

CREATE TABLE IF NOT EXISTS "storefront_loyalty_transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "order_id" UUID,
  "delta" INTEGER NOT NULL,
  "reason" VARCHAR(120) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_loyalty_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "storefront_reservations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "guest_name" VARCHAR(255) NOT NULL,
  "guest_email" VARCHAR(255),
  "guest_phone" VARCHAR(64),
  "party_size" INTEGER NOT NULL,
  "reserved_at" TIMESTAMP(3) NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_reservations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "storefront_campaigns" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "subject" VARCHAR(500) NOT NULL,
  "body_html" TEXT NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  "sent_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "storefront_reviews" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "storefront_id" UUID NOT NULL,
  "order_id" UUID,
  "rating" INTEGER NOT NULL,
  "title" VARCHAR(255),
  "body" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "storefront_customer_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "storefront_id" UUID NOT NULL,
  "session_key" VARCHAR(64) NOT NULL,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ended_at" TIMESTAMP(3),
  "page_views" INTEGER NOT NULL DEFAULT 0,
  "converted" BOOLEAN NOT NULL DEFAULT false,
  "revenue" DECIMAL(12,2),
  CONSTRAINT "storefront_customer_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "storefront_product_meta" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "storefront_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "dietary_tags" TEXT[] NOT NULL,
  "allergens" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_product_meta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_product_meta_storefront_id_product_id_key" ON "storefront_product_meta"("storefront_id", "product_id");

CREATE TABLE IF NOT EXISTS "storefront_push_subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "storefront_id" UUID NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dh" VARCHAR(255) NOT NULL,
  "auth" VARCHAR(255) NOT NULL,
  "customer_email" VARCHAR(255),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_push_subscriptions_endpoint_key" ON "storefront_push_subscriptions"("endpoint");

CREATE TABLE IF NOT EXISTS "storefront_referrals" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "storefront_id" UUID NOT NULL,
  "referrer_email" VARCHAR(255) NOT NULL,
  "referee_email" VARCHAR(255),
  "code" VARCHAR(32) NOT NULL,
  "reward_granted" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_referrals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_referrals_code_key" ON "storefront_referrals"("code");

CREATE TABLE IF NOT EXISTS "storefront_menu_schedules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "menu_id" UUID NOT NULL,
  "label" VARCHAR(255) NOT NULL,
  "starts_at" TIMESTAMP(3) NOT NULL,
  "ends_at" TIMESTAMP(3) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_menu_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "storefront_inventory_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "storefront_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "low_stock_at" INTEGER,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "storefront_inventory_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_inventory_items_storefront_id_product_id_key" ON "storefront_inventory_items"("storefront_id", "product_id");

ALTER TABLE "storefront_gift_cards" ADD CONSTRAINT "storefront_gift_cards_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_gift_card_redemptions" ADD CONSTRAINT "storefront_gift_card_redemptions_gift_card_id_fkey" FOREIGN KEY ("gift_card_id") REFERENCES "storefront_gift_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_upsell_rules" ADD CONSTRAINT "storefront_upsell_rules_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_loyalty_programs" ADD CONSTRAINT "storefront_loyalty_programs_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_loyalty_accounts" ADD CONSTRAINT "storefront_loyalty_accounts_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_loyalty_accounts" ADD CONSTRAINT "storefront_loyalty_accounts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "storefront_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_loyalty_transactions" ADD CONSTRAINT "storefront_loyalty_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "storefront_loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_loyalty_transactions" ADD CONSTRAINT "storefront_loyalty_transactions_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_reservations" ADD CONSTRAINT "storefront_reservations_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_campaigns" ADD CONSTRAINT "storefront_campaigns_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_reviews" ADD CONSTRAINT "storefront_reviews_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_customer_sessions" ADD CONSTRAINT "storefront_customer_sessions_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_product_meta" ADD CONSTRAINT "storefront_product_meta_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_push_subscriptions" ADD CONSTRAINT "storefront_push_subscriptions_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_referrals" ADD CONSTRAINT "storefront_referrals_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_menu_schedules" ADD CONSTRAINT "storefront_menu_schedules_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_inventory_items" ADD CONSTRAINT "storefront_inventory_items_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
