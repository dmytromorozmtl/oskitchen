# Packing exports

## Client exports (unchanged)

Located in `PackingExportsPanel`:

- PDF per customer / prepared bucket / fulfillment lane (jsPDF + autotable).
- CSV “all customers”.

## Future server exports

- Packing sheet by route / window (PDF).
- Label CSV.
- Production → packing handoff report.
- Export history (`downloadedAt` placeholder — no table yet).

Filters should mirror command center `date` + `fulfillment`.
