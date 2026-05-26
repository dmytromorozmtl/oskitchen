# Nutrition and allergen safety principles

1. **KitchenOS organizes data; it does not certify compliance.** Regulatory responsibility stays with the licensed business and its advisors.
2. **Business verification is mandatory before guest-facing use** of nutrition, allergen, and ingredient statements you choose to publish.
3. **Supplier documentation and lab results are the source of truth** for packaged claims; store references in `supplierDocumentRef` / `labResultRef` and your document control system.
4. **Calculated or imported values are estimates** until explicitly marked verified by authorized staff.
5. **Allergen statements require human review** — especially for cross-contact and “may contain” language.
6. **Internal verification status is operational metadata**, not a legal label claim.
7. **High-risk gaps** can be blocked from packing or storefront display using kitchen / storefront settings.

Copy surfaced in product UI: see `lib/nutrition/label-disclaimers.ts` and storefront disclaimer when data is withheld.
