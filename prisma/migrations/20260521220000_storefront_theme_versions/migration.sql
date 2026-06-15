-- CreateTable
CREATE TABLE "storefront_theme_versions" (
    "id" UUID NOT NULL,
    "storefront_id" UUID NOT NULL,
    "theme_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storefront_theme_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "storefront_theme_versions_storefront_id_created_at_idx" ON "storefront_theme_versions"("storefront_id", "created_at");

-- AddForeignKey
ALTER TABLE "storefront_theme_versions" ADD CONSTRAINT "storefront_theme_versions_storefront_id_fkey" FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
