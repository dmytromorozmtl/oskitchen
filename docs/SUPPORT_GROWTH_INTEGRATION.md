# Support ↔ growth & customer success

Support ticket creation continues to call `notifyGrowthInbound` (same optional founder inbox as partner/sales flows). Growth and Customer Success surfaces can subscribe to:

- Open ticket counts per workspace (query `SupportTicket` scoped by permissions).  
- Categories / priorities driving churn risk heuristics.  
- Beta lead linkage (future FK from `SupportTicket` to `BetaLead` or soft tag in `tagsJson`).

No duplicate ticket storage — one `SupportTicket` row is the system of record.
