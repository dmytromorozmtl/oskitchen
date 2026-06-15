import { IntegrationProvider } from "@prisma/client";

export const WEBHOOK_ASYNC_SUPPORTED_PROVIDERS: readonly IntegrationProvider[] = [
  IntegrationProvider.WOOCOMMERCE,
  IntegrationProvider.SHOPIFY,
];

export function isWebhookAsyncSupportedProvider(
  p: IntegrationProvider,
): boolean {
  return WEBHOOK_ASYNC_SUPPORTED_PROVIDERS.includes(p);
}
