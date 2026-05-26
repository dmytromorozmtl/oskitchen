# Nutrition print queue

`PrintedLabel` rows act as the **label print job** (same concept as a dedicated `LabelPrintJob` table).

- Create: `createPrintedLabelJobAction` from item page (template + copies).
- Complete: `markPrintedLabelJobAction` from `/dashboard/nutrition-labels/print-queue`.
- Each completion writes `LabelVerificationEvent` with profile type `LABEL`.
