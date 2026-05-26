# Menu planner rebuild

## Shipped in this iteration

- Business-mode page title (`getMenuPlannerPageTitle`).
- Tab shell: Calendar, Timeline, Board, Strategy, Coverage — with honest placeholder copy and links to Menu Center + catalog.
- Menu cards exclude the internal catalog; empty state shows a **planner setup checklist** instead of “create weekly menu only”.

## Next

- **Calendar:** day/week/month grid; feed from `Menu.preparedDatesJson`, `Menu.availabilityJson`, `ProductAvailability`, closures on `StorefrontSettings`.
- **Timeline:** publish → cutoff → production → pickup/delivery.
- **Board:** `@hello-pangea/dnd` or similar; lanes for draft/published/sold out.
- **Strategy:** visualize `MenuStrategy` milestones (happy hour, event, multi-brand).
- **Templates:** reuse `MenuTemplate` CRUD from Menu Center.
