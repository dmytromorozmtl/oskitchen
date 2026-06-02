"use client";

import * as React from "react";

import Link from "next/link";

import { RoiLeadCapture } from "@/components/marketing/roi-lead-capture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RoiCalculator() {
  const [weeklyOrders, setWeeklyOrders] = React.useState(250);
  const [aov, setAov] = React.useState(18);
  const [hours, setHours] = React.useState(12);
  const [cost, setCost] = React.useState(25);
  const [mistakes, setMistakes] = React.useState(8);
  const [growth, setGrowth] = React.useState(10);

  const hoursSaved = Math.round(hours * 0.35);
  const laborSaved = hoursSaved * cost * 4.33;
  const mistakeSavings = mistakes * aov * 0.4;
  const growthRevenue = weeklyOrders * (growth / 100) * aov * 4.33 * 0.08;
  const total = laborSaved + mistakeSavings + growthRevenue;
  const plan = weeklyOrders > 1000 ? "Team" : weeklyOrders > 100 ? "Pro" : "Starter";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="grid gap-3">
        <RoiField id="roi-weekly-orders" label="Weekly orders" value={weeklyOrders} onChange={setWeeklyOrders} />
        <RoiField id="roi-aov" label="Average order value" value={aov} onChange={setAov} />
        <RoiField id="roi-hours" label="Manual coordination hours/week" value={hours} onChange={setHours} />
        <RoiField id="roi-cost" label="Hourly admin/kitchen cost" value={cost} onChange={setCost} />
        <RoiField id="roi-mistakes" label="Monthly mistakes/refunds" value={mistakes} onChange={setMistakes} />
        <RoiField id="roi-growth" label="Expected growth %" value={growth} onChange={setGrowth} />
      </div>
      <div className="rounded-2xl border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">Conservative estimate, not a guarantee.</p>
        <h2 className="mt-2 text-3xl font-semibold">${Math.round(total).toLocaleString()}/mo</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p>Estimated hours saved: {hoursSaved}/week</p>
          <p>Labor value: ${Math.round(laborSaved).toLocaleString()}/mo</p>
          <p>Mistake reduction value: ${Math.round(mistakeSavings).toLocaleString()}/mo</p>
          <p>Recommended plan: {plan}</p>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <RoiLeadCapture
            estimatedSavingsMonthly={total}
            weeklyOrders={weeklyOrders}
            recommendedPlan={plan}
          />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/book-demo">Book demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function RoiField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
