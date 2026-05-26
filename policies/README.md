# Policies

Authorization rules (who may transition an order, edit costing, etc.) should live as pure functions consumed by server actions.

Pair with `lib/permissions` / role checks; avoid duplicating role string comparisons in components.
