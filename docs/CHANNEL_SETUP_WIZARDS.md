# Channel setup wizards

## Routes

- Pattern: `/dashboard/sales-channels/[providerKey]/setup`
- Live ecommerce/partner pages still live under `/dashboard/integrations/*` where forms already exist — the hub links honestly to those URLs.

## Target architecture (8 steps)

1. Overview — what the channel does today vs roadmap  
2. Requirements — plan, ENCRYPTION_KEY, partner approvals  
3. Credentials — server actions only; never echo secrets  
4. Test connection — Woo/Shopify API probes  
5. Webhooks — copy URLs; signature expectations  
6. Sync — order/product toggles  
7. Mapping — link to product mapping workbench  
8. Finish — revalidate hub + health  

## Persistence

`ChannelSetupProgress` (Prisma) stores `currentStep`, `completedStepsJson`, `skippedStepsJson` per `connectionId`. Wizard server actions should upsert this table as steps complete.
