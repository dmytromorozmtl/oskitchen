-- Product.category: enum → varchar (supports custom workspace categories).
ALTER TABLE "products" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "category" TYPE VARCHAR(64) USING "category"::text;
ALTER TABLE "products" ALTER COLUMN "category" SET DEFAULT 'OTHER';

CREATE TABLE "workspace_product_categories" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_product_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workspace_product_categories_user_id_code_key" ON "workspace_product_categories"("user_id", "code");
CREATE INDEX "workspace_product_categories_user_id_idx" ON "workspace_product_categories"("user_id");

ALTER TABLE "workspace_product_categories" ADD CONSTRAINT "workspace_product_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
