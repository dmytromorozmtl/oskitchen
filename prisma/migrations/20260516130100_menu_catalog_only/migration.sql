-- Internal catalog menu flag: items can live in a hidden menu without a "weekly" service menu.
ALTER TABLE "menus" ADD COLUMN "catalog_only" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "menus_user_id_catalog_only_idx" ON "menus" ("user_id", "catalog_only");

UPDATE "storefront_settings" AS ss
SET "active_menu_id" = NULL
FROM "menus" AS m
WHERE ss."active_menu_id" = m."id" AND m."catalog_only" = true;
