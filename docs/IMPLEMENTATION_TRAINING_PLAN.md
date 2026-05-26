# Training plan

`app/dashboard/implementation/[projectId]/training/page.tsx`

## Training matrix

`TRAINING_TRACKS` in `lib/implementation/implementation-types.ts`
ships a role × module recommendation:

| Role               | Modules                                |
|--------------------|----------------------------------------|
| Owner / admin      | orders, menus, analytics, reports      |
| Manager            | orders, production, packing, reports   |
| Kitchen lead       | production, menus                      |
| Packer             | packing                                |
| Driver             | routes                                 |
| Customer service   | crm, orders                            |
| Purchasing         | purchasing                             |
| Sales / catering   | catering, crm                          |

## Tracked items

Any checklist item in the Training phase or with `moduleKey="training"`
is pulled into the training tab so an owner can see at a glance which
training touchpoints are still open.

## Integration with Training module

For deeper tracking the page links out to `/dashboard/training`. The
Implementation Center stays opinionated about *what* needs training,
not *how* the LMS records completion.
