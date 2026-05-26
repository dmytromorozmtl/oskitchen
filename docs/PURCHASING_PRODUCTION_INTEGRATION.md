# Purchasing ↔ production

- Demand engine already includes production work items as a source; purchasing overview inherits those signals.
- Explicit “production-blocking shortage” flags on tasks / Today board are **not** implemented in this pass — add when production UI reads reorder/PO state.

Purchasing can later expose `requiredByDate` on PO lines aligned to batch `productionDate`.
