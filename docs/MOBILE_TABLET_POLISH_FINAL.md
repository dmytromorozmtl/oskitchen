# Mobile & Tablet Polish (Final)

## Priority surfaces

- POS terminal, Kitchen screen, Packing verify, Driver flows, Today, Order detail, Support triage, Core settings.

## Requirements checklist

- Touch targets **≥ 44px** for primary actions (audit POS + packing).  
- Sticky footers for primary actions on order detail / POS.  
- Avoid horizontal overflow except inside intentional table shells (`DataTableShell`).  
- Driver views must **mask** sensitive PII where feasible (phone partial display).

## Honest gap

Full responsive QA across every dashboard table is **not** complete in this pass — use `PRODUCT_EXCELLENCE_QA_MATRIX_1000.md` for device matrix testing.
