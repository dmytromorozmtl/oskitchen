/** P1-24 — pain-first hero copy and pain→solution bridges for ICP landings. */

export type IcpLandingPainPointP124 = {
  id: string;
  title: string;
  symptom: string;
  operatorCost: string;
  description: string;
  solution: string;
};

export const ICP_LANDING_P1_24_MEAL_PREP_HERO = {
  h1: 'Your Sunday spreadsheet is lying to your kitchen',
  subtitle:
    'When Shopify, Woo, and walk-ins export to different tabs, production cooks wrong quantities — and mispacks erode trust at pickup.',
  painHook: 'For operators shipping 200+ meals/week who outgrew manual cutoffs.',
} as const;

export const ICP_LANDING_P1_24_GHOST_KITCHEN_HERO = {
  h1: 'Four delivery tablets. Zero margin per brand.',
  subtitle:
    'Ghost kitchens lose leverage when every channel pings a different screen and nobody sees which virtual brand earns its shelf space.',
  painHook: 'For multi-brand operators tired of blended P&L and expo chaos.',
} as const;

export const ICP_LANDING_P1_24_MEAL_PREP_PAINS: IcpLandingPainPointP124[] = [
  {
    id: 'spreadsheet-reconciliation',
    title: 'Sunday spreadsheet reconciliation',
    symptom: 'Three exports, one kitchen — quantities rebuilt by hand every week.',
    operatorCost: '2–4 hours every Sunday + wrong batch sizes before ovens turn on.',
    description:
      'Shopify, Woo, and walk-in orders export to different tabs — production quantities are wrong before the first tray hits the oven.',
    solution: 'Order hub merges every channel → production board auto-quantities from confirmed orders.',
  },
  {
    id: 'cutoff-chaos',
    title: 'Cutoff chaos',
    symptom: 'Customers order after the kitchen locked the menu — or ops forget to close the storefront.',
    operatorCost: 'Mid-prep batch changes, wasted ingredients, and angry pickup-window customers.',
    description:
      'Cutoff enforcement is manual or inconsistent — batch sizes shift mid-prep when late orders slip through.',
    solution: 'Weekly menu + storefront cutoff rules lock production day to what sold before deadline.',
  },
  {
    id: 'packing-mistakes',
    title: 'Packing mistakes at handoff',
    symptom: 'Lane sheets are handwritten or missing dietary flags.',
    operatorCost: 'Mispacks during pickup windows — refunds, remakes, and lost subscribers.',
    description:
      'Packing is the last mile where trust breaks — one wrong meal in a subscription box costs a customer.',
    solution: 'Packing lanes grouped by pickup window + customer with label-ready sheets.',
  },
];

export const ICP_LANDING_P1_24_GHOST_KITCHEN_PAINS: IcpLandingPainPointP124[] = [
  {
    id: 'tablet-sprawl',
    title: 'Every brand has its own tablet',
    symptom: 'Uber, DoorDash, Shopify, and a fourth virtual brand each ping a different screen.',
    operatorCost: 'Expo misses tickets, remakes spike, and labor burns on channel toggling.',
    description:
      'The kitchen never sees one prioritized queue — rush hour becomes a game of whack-a-mole across devices.',
    solution: 'Order Hub — one ticket stream with brand + channel filters on a single KDS.',
  },
  {
    id: 'blind-purchasing',
    title: 'Purchasing blind to what sold',
    symptom: 'Commissary buyers reorder from habit while brand-level demand shifts weekly.',
    operatorCost: 'Food cost drift and dead inventory before anyone opens a spreadsheet.',
    description:
      'Margin leaks when purchasing is disconnected from yesterday\'s ticket volume per brand.',
    solution: 'AI-assisted purchasing suggestions from order + recipe demand — buyer approves every PO.',
  },
  {
    id: 'blended-pnl',
    title: 'No honest P&L per virtual brand',
    symptom: 'Revenue rolls up in payment processor reports — labor and food cost stay blended.',
    operatorCost: 'Weak brands stay on the menu months too long; strong brands under-invested.',
    description:
      'You cannot kill the underperformer fast enough when every virtual brand shares one P&L line.',
    solution: 'Brand P&L snapshot — directional margin per virtual brand in the command center.',
  },
];

export function icpLandingP124PainsForSegment(
  segment: 'meal-prep' | 'ghost-kitchen',
): IcpLandingPainPointP124[] {
  return segment === 'meal-prep'
    ? ICP_LANDING_P1_24_MEAL_PREP_PAINS
    : ICP_LANDING_P1_24_GHOST_KITCHEN_PAINS;
}

export function icpLandingP124HeroForSegment(segment: 'meal-prep' | 'ghost-kitchen') {
  return segment === 'meal-prep'
    ? ICP_LANDING_P1_24_MEAL_PREP_HERO
    : ICP_LANDING_P1_24_GHOST_KITCHEN_HERO;
}
