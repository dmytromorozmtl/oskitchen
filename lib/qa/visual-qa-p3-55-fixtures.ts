/** Static fixture data for P3-55 visual QA surfaces. */

export const VISUAL_QA_POS_PRODUCTS = [
  { id: "bowl", title: "Power Bowl", price: 14.5, category: "Mains" },
  { id: "wrap", title: "Grilled Wrap", price: 12.0, category: "Mains" },
  { id: "salad", title: "Market Salad", price: 11.5, category: "Mains" },
  { id: "smoothie", title: "Green Smoothie", price: 8.0, category: "Drinks" },
  { id: "cookie", title: "Oat Cookie", price: 4.5, category: "Dessert" },
  { id: "coffee", title: "Cold Brew", price: 5.0, category: "Drinks" },
] as const;

export const VISUAL_QA_KDS_TICKETS = [
  { id: "t1", number: "#A042", items: "2× Power Bowl, 1× Smoothie", station: "NEW", elapsed: "1m" },
  { id: "t2", number: "#A043", items: "1× Wrap, 1× Salad", station: "IN PROGRESS", elapsed: "6m" },
  { id: "t3", number: "#A044", items: "3× Cookie, 2× Coffee", station: "READY", elapsed: "11m" },
] as const;

export const VISUAL_QA_TODAY_STATS = [
  { label: "Revenue today", value: "$4,280", delta: "+12%" },
  { label: "Active orders", value: "18", delta: "6 in kitchen" },
  { label: "Labour %", value: "28.4%", delta: "On target" },
  { label: "Integrations", value: "16/18", delta: "2 need attention" },
] as const;
