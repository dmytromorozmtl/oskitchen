-- Link external_orders to import batches for Order Hub traceability.

ALTER TABLE "external_orders" ADD COLUMN "channel_import_batch_id" UUID;

CREATE INDEX "external_orders_channel_import_batch_id_idx" ON "external_orders"("channel_import_batch_id");

ALTER TABLE "external_orders" ADD CONSTRAINT "external_orders_channel_import_batch_id_fkey" FOREIGN KEY ("channel_import_batch_id") REFERENCES "channel_import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
