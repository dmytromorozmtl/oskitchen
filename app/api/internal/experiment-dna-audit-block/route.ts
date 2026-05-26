import { NextResponse } from "next/server";
import { z } from "zod";

import { coalesceThemeExperimentJson, toInputJsonValue } from "@/lib/prisma/json";

import { appendDnaAuditBlock, isDnaAuditTrailEnabled } from "@/lib/compliance/dna-encoded-audit-trail";
import {
  isPqcDnaArchivalEnabled,
  sealPqcDnaArchivalFromTrail,
} from "@/lib/compliance/pqc-dna-archival";
import {
  batchRecursiveZkFromRollups,
  isRecursiveZkDnaRollupEnabled,
} from "@/lib/compliance/recursive-zk-dna-rollup";
import {
  evolveHypergraphFromVerifiedDag,
  isHypergraphEvolutionEnabled,
} from "@/lib/compliance/hypergraph-evolution";
import {
  isHypergraphL3RecursiveAnchorEnabled,
  recursiveAnchorL3FromEvolution,
} from "@/lib/compliance/hypergraph-l3-recursive-anchor";
import {
  isHypergraphL4MetaAnchorEnabled,
  metaAnchorL4FromL3Stack,
} from "@/lib/compliance/hypergraph-l4-meta-anchor";
import {
  compositionalAnchorL5FromL4Stack,
  isHypergraphL5CompositionalAnchorEnabled,
} from "@/lib/compliance/hypergraph-l5-compositional-anchor";
import {
  holographicAnchorL6FromL5Stack,
  isHypergraphL6HolographicAnchorEnabled,
} from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import {
  entanglementAnchorL7FromL6Stack,
  isHypergraphL7EntanglementAnchorEnabled,
} from "@/lib/compliance/hypergraph-l7-entanglement-anchor";
import {
  faultTolerantAnchorL8FromL7Stack,
  isHypergraphL8FaultTolerantAnchorEnabled,
} from "@/lib/compliance/hypergraph-l8-fault-tolerant-anchor";
import {
  byzantineAnchorL9FromL8Stack,
  isHypergraphL9ByzantineAnchorEnabled,
} from "@/lib/compliance/hypergraph-l9-byzantine-anchor";
import {
  isHypergraphL10QuantumResilientAnchorEnabled,
  quantumResilientAnchorL10FromL9Stack,
} from "@/lib/compliance/hypergraph-l10-quantum-resilient-anchor";
import {
  isHypergraphL11TopologicalFaultTolerantAnchorEnabled,
  topologicalFaultTolerantAnchorL11FromL10Stack,
} from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";
import {
  categoricalQuantumAnchorL12FromL11Stack,
  isHypergraphL12CategoricalQuantumAnchorEnabled,
} from "@/lib/compliance/hypergraph-l12-categorical-quantum-anchor";
import {
  homotopyTypeTheoreticAnchorL13FromL12Stack,
  isHypergraphL13HomotopyTypeTheoreticAnchorEnabled,
} from "@/lib/compliance/hypergraph-l13-homotopy-type-theoretic-anchor";
import {
  isHypergraphZkDnaEnabled,
  rollupHypergraphFromRecursive,
} from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { isZkDnaRollupEnabled, rollupZkDnaFromFederation } from "@/lib/compliance/zk-dna-rollup";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  eventType: z.string().min(1).max(64),
  payload: z.record(z.unknown()),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isDnaAuditTrailEnabled()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const secret = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
  if (!secret || request.headers.get("x-kos-mw-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sf = await prisma.storefrontSettings.findFirst({
    where: { storeSlug: parsed.data.storeSlug },
    select: { id: true, themeExperimentJson: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let mergedJson = coalesceThemeExperimentJson(sf.themeExperimentJson);
  const { json: merged, chainValid, block } = appendDnaAuditBlock(mergedJson, {
    eventType: parsed.data.eventType,
    payload: parsed.data.payload,
  });
  mergedJson = coalesceThemeExperimentJson(merged);

  let pqcSealed = false;
  if (isPqcDnaArchivalEnabled()) {
    const sealed = sealPqcDnaArchivalFromTrail(mergedJson);
    mergedJson = coalesceThemeExperimentJson(sealed.json);
    pqcSealed = sealed.snap.chainSealed;
  }

  let zkRollupVerified = false;
  if (isZkDnaRollupEnabled()) {
    const rolled = rollupZkDnaFromFederation(mergedJson);
    mergedJson = coalesceThemeExperimentJson(rolled.json);
    zkRollupVerified = rolled.proof?.verified ?? false;
  }

  let recursiveZkVerified = false;
  if (isRecursiveZkDnaRollupEnabled()) {
    const batched = batchRecursiveZkFromRollups(mergedJson);
    mergedJson = coalesceThemeExperimentJson(batched.json);
    recursiveZkVerified = batched.batch?.verified ?? false;
  }

  let hypergraphZkVerified = false;
  if (isHypergraphZkDnaEnabled()) {
    const hg = rollupHypergraphFromRecursive(mergedJson);
    mergedJson = coalesceThemeExperimentJson(hg.json);
    hypergraphZkVerified = hg.proof?.verified ?? false;
  }

  let hypergraphEvolutionAnchored = false;
  if (isHypergraphEvolutionEnabled()) {
    const evo = evolveHypergraphFromVerifiedDag(mergedJson);
    mergedJson = coalesceThemeExperimentJson(evo.json);
    hypergraphEvolutionAnchored = evo.anchor?.anchored ?? false;
  }

  let hypergraphL3Anchored = false;
  if (isHypergraphL3RecursiveAnchorEnabled()) {
    const l3 = recursiveAnchorL3FromEvolution(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l3.json);
    hypergraphL3Anchored = l3.anchor?.anchored ?? false;
  }

  let hypergraphL4MetaAnchored = false;
  if (isHypergraphL4MetaAnchorEnabled()) {
    const l4 = metaAnchorL4FromL3Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l4.json);
    hypergraphL4MetaAnchored = l4.anchor?.anchored ?? false;
  }

  let hypergraphL5CompositionalAnchored = false;
  if (isHypergraphL5CompositionalAnchorEnabled()) {
    const l5 = compositionalAnchorL5FromL4Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l5.json);
    hypergraphL5CompositionalAnchored = l5.anchor?.anchored ?? false;
  }

  let hypergraphL6HolographicAnchored = false;
  if (isHypergraphL6HolographicAnchorEnabled()) {
    const l6 = holographicAnchorL6FromL5Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l6.json);
    hypergraphL6HolographicAnchored = l6.anchor?.anchored ?? false;
  }

  let hypergraphL7EntanglementAnchored = false;
  if (isHypergraphL7EntanglementAnchorEnabled()) {
    const l7 = entanglementAnchorL7FromL6Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l7.json);
    hypergraphL7EntanglementAnchored = l7.anchor?.anchored ?? false;
  }

  let hypergraphL8FaultTolerantAnchored = false;
  if (isHypergraphL8FaultTolerantAnchorEnabled()) {
    const l8 = faultTolerantAnchorL8FromL7Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l8.json);
    hypergraphL8FaultTolerantAnchored = l8.anchor?.anchored ?? false;
  }

  let hypergraphL9ByzantineAnchored = false;
  if (isHypergraphL9ByzantineAnchorEnabled()) {
    const l9 = byzantineAnchorL9FromL8Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l9.json);
    hypergraphL9ByzantineAnchored = l9.anchor?.anchored ?? false;
  }

  let hypergraphL10QuantumResilientAnchored = false;
  if (isHypergraphL10QuantumResilientAnchorEnabled()) {
    const l10 = quantumResilientAnchorL10FromL9Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l10.json);
    hypergraphL10QuantumResilientAnchored = l10.anchor?.anchored ?? false;
  }

  let hypergraphL11TopologicalFaultTolerantAnchored = false;
  if (isHypergraphL11TopologicalFaultTolerantAnchorEnabled()) {
    const l11 = topologicalFaultTolerantAnchorL11FromL10Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l11.json);
    hypergraphL11TopologicalFaultTolerantAnchored = l11.anchor?.anchored ?? false;
  }

  let hypergraphL12CategoricalQuantumAnchored = false;
  if (isHypergraphL12CategoricalQuantumAnchorEnabled()) {
    const l12 = categoricalQuantumAnchorL12FromL11Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l12.json);
    hypergraphL12CategoricalQuantumAnchored = l12.anchor?.anchored ?? false;
  }

  let hypergraphL13HomotopyTypeTheoreticAnchored = false;
  if (isHypergraphL13HomotopyTypeTheoreticAnchorEnabled()) {
    const l13 = homotopyTypeTheoreticAnchorL13FromL12Stack(mergedJson);
    mergedJson = coalesceThemeExperimentJson(l13.json);
    hypergraphL13HomotopyTypeTheoreticAnchored = l13.anchor?.anchored ?? false;
  }

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: toInputJsonValue(mergedJson) },
  });

  return NextResponse.json({
    ok: true,
    chainValid,
    blockIndex: block.blockIndex,
    basePairs: block.basePairs,
    pqcSealed,
    zkRollupVerified,
    recursiveZkVerified,
    hypergraphZkVerified,
    hypergraphEvolutionAnchored,
    hypergraphL3Anchored,
    hypergraphL4MetaAnchored,
    hypergraphL5CompositionalAnchored,
    hypergraphL6HolographicAnchored,
    hypergraphL7EntanglementAnchored,
    hypergraphL8FaultTolerantAnchored,
    hypergraphL9ByzantineAnchored,
    hypergraphL10QuantumResilientAnchored,
    hypergraphL11TopologicalFaultTolerantAnchored,
    hypergraphL12CategoricalQuantumAnchored,
    hypergraphL13HomotopyTypeTheoreticAnchored,
  });
}
