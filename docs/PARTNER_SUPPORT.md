# Partner support center

## Model

`PartnerManagedTicket` (mapped to `partner_support_tickets`) tracks partner-facing work: priority, category, assignment, status, linkage to `PartnerClient` / `Workspace`.

## Dashboard

**Support load** KPI counts open tickets for accessible partner accounts (see `partner-support-service`).

## Roadmap

- SLA timers per `supportTier` on the managed client.  
- Escalation paths to internal OS Kitchen support with mirrored status.  
- Customer-visible vs internal notes split + visibility enum.  
- Integration failure ingestion from sync jobs into ticket suggestions.
