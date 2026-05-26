# Final business mode QA matrix

Run manually after substantive changes. **Automated:** `npm run typecheck`, `npm run build`.

| Mode | Onboarding | Nav focus | Modules reset | Terminology | Today | Playbooks | Templates | Demo import | Login landing |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Meal prep | Step 1 workflow select + profile | Hides exec/impl by default | Recommended reset | nav overrides | Widget list | Primary playbook | Card | `/demo/meal-prep` | `/dashboard/today` |
| Catering | same | Catering forward | same | packages/events | same | catering-event | same | `/demo/catering` | owner |
| Ghost / Cloud / Multi | same | Brands + hub visible | same | brand labels | same | ghost rush | same | `/demo/ghost-kitchen` | owner |
| Restaurant | same | Service stack | same | defaults | same | restaurant daily | same | `/demo/restaurant` | owner |
| Café | same | specials + CRM | same | specials copy | same | cafe morning | same | `/demo/cafe` | owner |
| Bar | same | drinks + events | same | catering → event requests | same | bar night | same | `/demo/bar` | owner |
| Bakery | same | preorder + labels | same | bakery copy | same | bakery day | same | `/demo/bakery` | owner |
| Staff user | N/A | Full modules if owner toggled | N/A | N/A | Kitchen default | N/A | N/A | N/A | `/dashboard/kitchen` |
| Platform super | bypass gates | All groups + platform | bypass | N/A | N/A | all playbooks | N/A | all demos | `/dashboard/today` |

**Integration health:** spot-check `/dashboard/today` links to webhooks + integration health when counts > 0.

**Security:** no secrets in client bundles; `.env` not referenced from client components.
