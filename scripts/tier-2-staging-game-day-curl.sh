#!/usr/bin/env bash
# Tier 2 staging game-day — curl all experiment crons with CRON_SECRET (52 paths).
set -euo pipefail

BASE="${STAGING_BASE_URL:-http://127.0.0.1:3000}"
SECRET="${CRON_SECRET:?Set CRON_SECRET}"

CRONS=(
  "/api/cron/recursive-zk-dna-rollup"
  "/api/cron/hypergraph-zk-dna-rollup"
  "/api/cron/hypergraph-evolution-anchor"
  "/api/cron/prefrontal-ethics-board-sync"
  "/api/cron/indo-pacific-compact-sync"
  "/api/cron/eu-ai-act-live-registry-sync"
  "/api/cron/cosmic-web-federation-sync"
  "/api/cron/pan-pacific-quantum-mesh-sync"
  "/api/cron/uk-dsit-algorithmic-transparency-sync"
  "/api/cron/multiverse-outcome-crdt-sync"
  "/api/cron/hypergraph-l3-recursive-anchor"
  "/api/cron/cerebellar-motor-organoid-sync"
  "/api/cron/arctic-quantum-mesh-sync"
  "/api/cron/nist-ai-rmf-live-control-feed-sync"
  "/api/cron/omniverse-causal-graph-crdt-sync"
  "/api/cron/hypergraph-l4-meta-anchor"
  "/api/cron/brainstem-autonomic-guard-sync"
  "/api/cron/antarctic-subglacial-mesh-sync"
  "/api/cron/eu-ai-act-art71-pmm-live-sync"
  "/api/cron/multiverse-counterfactual-crdt-sync"
  "/api/cron/hypergraph-l5-compositional-anchor"
  "/api/cron/spinal-cord-publish-throttle-sync"
  "/api/cron/lunar-farside-dtn-mesh-sync"
  "/api/cron/us-ftc-ai-transparency-live-sync"
  "/api/cron/parallel-universe-merge-crdt-sync"
  "/api/cron/hypergraph-l6-holographic-anchor"
  "/api/cron/medulla-oblongata-emergency-halt-sync"
  "/api/cron/martian-orbital-dtn-relay-sync"
  "/api/cron/oecd-state-ag-ai-transparency-mesh-sync"
  "/api/cron/multiverse-reconciliation-crdt-sync"
  "/api/cron/hypergraph-l7-entanglement-anchor"
  "/api/cron/pons-autonomic-bridge-failover-sync"
  "/api/cron/jupiter-trojan-dtn-lagrange-sync"
  "/api/cron/un-ai-office-global-registry-mesh-sync"
  "/api/cron/omniverse-epoch-seal-crdt-sync"
  "/api/cron/hypergraph-l8-fault-tolerant-anchor"
  "/api/cron/midbrain-arousal-publish-pacing-sync"
  "/api/cron/saturn-ring-dtn-shepherd-sync"
  "/api/cron/icao-imo-ai-aviation-registry-sync"
  "/api/cron/metaverse-finality-seal-crdt-sync"
  "/api/cron/hypergraph-l9-byzantine-anchor"
  "/api/cron/thalamus-sensory-gating-publish-sync"
  "/api/cron/uranus-obliquity-dtn-polar-relay-sync"
  "/api/cron/wto-upu-cross-border-ai-trade-registry-sync"
  "/api/cron/multiverse-causality-lock-crdt-sync"
  "/api/cron/hypergraph-l10-quantum-resilient-anchor"
  "/api/cron/basal-ganglia-action-selection-publish-sync"
  "/api/cron/neptune-triton-retrograde-dtn-halo-sync"
  "/api/cron/itu-uncitral-digital-commerce-ai-registry-sync"
  "/api/cron/omniverse-epoch-freeze-crdt-sync"
  "/api/cron/hypergraph-l11-topological-fault-tolerant-anchor"
  "/api/cron/cerebellum-motor-refinement-publish-sync"
  "/api/cron/pluto-charon-binary-dtn-barycenter-sync"
  "/api/cron/iso-iec-ai-standards-harmonization-registry-sync"
  "/api/cron/multiverse-timeline-seal-crdt-sync"
  "/api/cron/hypergraph-l12-categorical-quantum-anchor"
  "/api/cron/motor-cortex-execution-publish-sync"
  "/api/cron/kuiper-scattered-disk-dtn-aphelion-sync"
  "/api/cron/cen-cenelec-digital-product-governance-registry-sync"
  "/api/cron/multiverse-branch-merge-seal-crdt-sync"
  "/api/cron/hypergraph-l13-homotopy-type-theoretic-anchor"
  "/api/cron/premotor-sma-planning-publish-sync"
)

echo "== KitchenOS Tier 2 cron game-day =="
echo "BASE=$BASE"
echo "Crons: ${#CRONS[@]}"

fail=0
for path in "${CRONS[@]}"; do
  code=$(curl -sS -o /tmp/kos-cron-out.json -w "%{http_code}" \
    -H "Authorization: Bearer $SECRET" \
    "${BASE}${path}")
  if [[ "$code" != "200" ]]; then
    echo "FAIL $path HTTP $code"
    cat /tmp/kos-cron-out.json 2>/dev/null || true
    fail=$((fail + 1))
  else
    echo "OK   $path"
  fi
done

if [[ "$fail" -gt 0 ]]; then
  echo "$fail cron(s) failed"
  exit 1
fi
echo "All ${#CRONS[@]} crons returned 200"
