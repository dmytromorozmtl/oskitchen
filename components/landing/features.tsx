"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  ClipboardList,
  Link2,
  MapPin,
  Package,
  ScanLine,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";

const items = [
  {
    title: "Order hub",
    body: "POS, storefront, imports, and shaped channel payloads in one queue — maturity is labeled honestly (live, beta, setup-ready, partner-required, roadmap).",
    icon: ShoppingCart,
  },
  {
    title: "Product mapping",
    body: "Resolve external SKUs to kitchen catalog items before production runs — no fake auto-mapping from marketplaces.",
    icon: Link2,
  },
  {
    title: "Production & kitchen",
    body: "Station-aware work items and kitchen views for cafés, bakeries, meal prep, catering, and ghost kitchens.",
    icon: ClipboardList,
  },
  {
    title: "Packing & labels",
    body: "Lane pickup vs delivery, verification paths, and printable flows where your workspace enables them.",
    icon: Package,
  },
  {
    title: "Routes & handoff",
    body: "Pickup-first teams stay light; delivery adds manifests and geography-aware modules when you configure them.",
    icon: MapPin,
  },
  {
    title: "POS Terminal",
    body: "Browser-first counter and pickup-desk sales — same KitchenOS orders as online channels. Stripe Terminal hardware / native drivers are not integrated; see /product/pos-terminal.",
    icon: ScanLine,
  },
  {
    title: "CRM & customers",
    body: "Guest-friendly defaults with optional profiles for follow-ups when your team links accounts.",
    icon: Users,
  },
  {
    title: "Analytics & costing foundation",
    body: "Workspace-grounded rollups and costing confidence — not a replacement for full accounting suites.",
    icon: BarChart3,
  },
  {
    title: "Storefront",
    body: "Preorder surfaces when enabled on your plan — Stripe-backed checkout only when you configure keys.",
    icon: Store,
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            One workspace for the full food operations loop
          </h2>
          <p className="mt-4 text-muted-foreground">
            KitchenOS is the operating system for modern food operations: run POS sales, online orders, production,
            packing, delivery, customers, and integrations from one place. What lights up depends on your plan,
            credentials, and data — not on vague &quot;fully automated&quot; promises.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm backdrop-blur"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
