# Support ↔ partner integration

## Schema

`SupportTicket.partnerAccountId` optional FK to `PartnerAccount`.

## Behavior

Partners do not automatically gain triage inbox; link tickets explicitly or build a scoped partner view that filters `partnerAccountId` **and** verifies partner membership (see partner permissions). KitchenOS partner managed tickets remain separate (`PartnerManagedTicket`) until unified routing is defined.
