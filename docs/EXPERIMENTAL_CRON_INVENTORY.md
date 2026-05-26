# Experimental cron inventory

Generated: 2026-05-20

| Metric | Value |
|--------|------:|
| Total cron routes on disk | 133 |
| Production allowlist | 12 |
| Experimental (active) | 121 |

Production slugs are defined in `services/cron/production-manifest.ts` and documented in `docs/CRON_INVENTORY.md`.

Experimental routes return **404** in production unless `ENABLE_EXPERIMENTAL_CRONS=true`.
Discovery: `listExperimentalCronPathsOnDisk()` in `services/cron/cron-route-inventory.ts`.

## Categories

### Storefront experiments (24)

Theme/A-B experiment lifecycle, SRM, holdout, edge sync helpers.

| Slug | Path |
|------|------|
| `storefront-experiment-audit-archive` | `/api/cron/storefront-experiment-audit-archive` |
| `storefront-experiment-audit-control` | `/api/cron/storefront-experiment-audit-control` |
| `storefront-experiment-auto-conclude` | `/api/cron/storefront-experiment-auto-conclude` |
| `storefront-experiment-autonomous-scientist` | `/api/cron/storefront-experiment-autonomous-scientist` |
| `storefront-experiment-causal-discovery` | `/api/cron/storefront-experiment-causal-discovery` |
| `storefront-experiment-cislunar-dtn-sync` | `/api/cron/storefront-experiment-cislunar-dtn-sync` |
| `storefront-experiment-contextual-bandit` | `/api/cron/storefront-experiment-contextual-bandit` |
| `storefront-experiment-crdt-gossip` | `/api/cron/storefront-experiment-crdt-gossip` |
| `storefront-experiment-dtn-mesh-sync` | `/api/cron/storefront-experiment-dtn-mesh-sync` |
| `storefront-experiment-ebpf-purge` | `/api/cron/storefront-experiment-ebpf-purge` |
| `storefront-experiment-feature-store` | `/api/cron/storefront-experiment-feature-store` |
| `storefront-experiment-global-mesh-sync` | `/api/cron/storefront-experiment-global-mesh-sync` |
| `storefront-experiment-holdout-decay` | `/api/cron/storefront-experiment-holdout-decay` |
| `storefront-experiment-holdout-ws-sync` | `/api/cron/storefront-experiment-holdout-ws-sync` |
| `storefront-experiment-interference-holdout` | `/api/cron/storefront-experiment-interference-holdout` |
| `storefront-experiment-linucb-realtime` | `/api/cron/storefront-experiment-linucb-realtime` |
| `storefront-experiment-linucb-stream` | `/api/cron/storefront-experiment-linucb-stream` |
| `storefront-experiment-mab-update` | `/api/cron/storefront-experiment-mab-update` |
| `storefront-experiment-multi-agent-orchestrator` | `/api/cron/storefront-experiment-multi-agent-orchestrator` |
| `storefront-experiment-planet-edge` | `/api/cron/storefront-experiment-planet-edge` |
| `storefront-experiment-post-publish-guard` | `/api/cron/storefront-experiment-post-publish-guard` |
| `storefront-experiment-report` | `/api/cron/storefront-experiment-report` |
| `storefront-experiment-srm` | `/api/cron/storefront-experiment-srm` |
| `storefront-experiment-vertex-promote` | `/api/cron/storefront-experiment-vertex-promote` |

### Regulatory / compliance scaffold (19)

Compliance automation stubs — gated; not a certified control plane.

| Slug | Path |
|------|------|
| `cmmc-l3-monitoring` | `/api/cron/cmmc-l3-monitoring` |
| `eu-ai-act-art71-pmm-live-sync` | `/api/cron/eu-ai-act-art71-pmm-live-sync` |
| `eu-ai-act-live-registry-sync` | `/api/cron/eu-ai-act-live-registry-sync` |
| `eu-ai-act-seed` | `/api/cron/eu-ai-act-seed` |
| `eu-ai-office-conformity-sync` | `/api/cron/eu-ai-office-conformity-sync` |
| `eu-ai-office-continuous-conformity-sync` | `/api/cron/eu-ai-office-continuous-conformity-sync` |
| `fedramp-high-monitoring` | `/api/cron/fedramp-high-monitoring` |
| `hipaa-baa-evidence-binder` | `/api/cron/hipaa-baa-evidence-binder` |
| `irap-essential-eight-monitoring` | `/api/cron/irap-essential-eight-monitoring` |
| `iso-42001-ai-ms-seed` | `/api/cron/iso-42001-ai-ms-seed` |
| `iso-42001-cert-body-seed` | `/api/cron/iso-42001-cert-body-seed` |
| `iso-42001-stage2-surveillance` | `/api/cron/iso-42001-stage2-surveillance` |
| `iso-iec-ai-standards-harmonization-registry-sync` | `/api/cron/iso-iec-ai-standards-harmonization-registry-sync` |
| `nist-ai-rmf-live-control-feed-sync` | `/api/cron/nist-ai-rmf-live-control-feed-sync` |
| `nist-ai-rmf-seed` | `/api/cron/nist-ai-rmf-seed` |
| `pci-dss-saq-attestation` | `/api/cron/pci-dss-saq-attestation` |
| `soc2-experiment-evidence` | `/api/cron/soc2-experiment-evidence` |
| `soc2-fedramp-replicate` | `/api/cron/soc2-fedramp-replicate` |
| `soc2-type2-evidence-binder` | `/api/cron/soc2-type2-evidence-binder` |

### Research / novelty scaffold (30)

Experimental research cron hooks — no product SLA.

| Slug | Path |
|------|------|
| `antarctic-subglacial-mesh-sync` | `/api/cron/antarctic-subglacial-mesh-sync` |
| `arctic-quantum-mesh-sync` | `/api/cron/arctic-quantum-mesh-sync` |
| `basal-ganglia-action-selection-publish-sync` | `/api/cron/basal-ganglia-action-selection-publish-sync` |
| `brainstem-autonomic-guard-sync` | `/api/cron/brainstem-autonomic-guard-sync` |
| `cen-cenelec-digital-product-governance-registry-sync` | `/api/cron/cen-cenelec-digital-product-governance-registry-sync` |
| `galactic-mesh-sync` | `/api/cron/galactic-mesh-sync` |
| `hypergraph-evolution-anchor` | `/api/cron/hypergraph-evolution-anchor` |
| `hypergraph-l10-quantum-resilient-anchor` | `/api/cron/hypergraph-l10-quantum-resilient-anchor` |
| `hypergraph-l11-topological-fault-tolerant-anchor` | `/api/cron/hypergraph-l11-topological-fault-tolerant-anchor` |
| `hypergraph-l12-categorical-quantum-anchor` | `/api/cron/hypergraph-l12-categorical-quantum-anchor` |
| `hypergraph-l13-homotopy-type-theoretic-anchor` | `/api/cron/hypergraph-l13-homotopy-type-theoretic-anchor` |
| `hypergraph-l3-recursive-anchor` | `/api/cron/hypergraph-l3-recursive-anchor` |
| `hypergraph-l4-meta-anchor` | `/api/cron/hypergraph-l4-meta-anchor` |
| `hypergraph-l5-compositional-anchor` | `/api/cron/hypergraph-l5-compositional-anchor` |
| `hypergraph-l6-holographic-anchor` | `/api/cron/hypergraph-l6-holographic-anchor` |
| `hypergraph-l7-entanglement-anchor` | `/api/cron/hypergraph-l7-entanglement-anchor` |
| `hypergraph-l8-fault-tolerant-anchor` | `/api/cron/hypergraph-l8-fault-tolerant-anchor` |
| `hypergraph-l9-byzantine-anchor` | `/api/cron/hypergraph-l9-byzantine-anchor` |
| `hypergraph-zk-dna-rollup` | `/api/cron/hypergraph-zk-dna-rollup` |
| `martian-orbital-dtn-relay-sync` | `/api/cron/martian-orbital-dtn-relay-sync` |
| `multiverse-branch-merge-seal-crdt-sync` | `/api/cron/multiverse-branch-merge-seal-crdt-sync` |
| `multiverse-causality-lock-crdt-sync` | `/api/cron/multiverse-causality-lock-crdt-sync` |
| `multiverse-counterfactual-crdt-sync` | `/api/cron/multiverse-counterfactual-crdt-sync` |
| `multiverse-outcome-crdt-sync` | `/api/cron/multiverse-outcome-crdt-sync` |
| `multiverse-reconciliation-crdt-sync` | `/api/cron/multiverse-reconciliation-crdt-sync` |
| `multiverse-timeline-seal-crdt-sync` | `/api/cron/multiverse-timeline-seal-crdt-sync` |
| `omniverse-causal-graph-crdt-sync` | `/api/cron/omniverse-causal-graph-crdt-sync` |
| `omniverse-epoch-freeze-crdt-sync` | `/api/cron/omniverse-epoch-freeze-crdt-sync` |
| `omniverse-epoch-seal-crdt-sync` | `/api/cron/omniverse-epoch-seal-crdt-sync` |
| `thalamus-sensory-gating-publish-sync` | `/api/cron/thalamus-sensory-gating-publish-sync` |

### Other experimental (48)

Misc experimental sync / scaffold routes.

| Slug | Path |
|------|------|
| `cerebellar-motor-organoid-sync` | `/api/cron/cerebellar-motor-organoid-sync` |
| `cerebellum-motor-refinement-publish-sync` | `/api/cron/cerebellum-motor-refinement-publish-sync` |
| `cortical-organoid-mesh-sync` | `/api/cron/cortical-organoid-mesh-sync` |
| `cosmic-web-federation-sync` | `/api/cron/cosmic-web-federation-sync` |
| `dna-audit-trail-archive` | `/api/cron/dna-audit-trail-archive` |
| `eo-14110-inventory-seed` | `/api/cron/eo-14110-inventory-seed` |
| `experiment-bq-private-link-audit` | `/api/cron/experiment-bq-private-link-audit` |
| `five-eyes-cloud-compact-monitoring` | `/api/cron/five-eyes-cloud-compact-monitoring` |
| `five-eyes-plus-compact-monitoring` | `/api/cron/five-eyes-plus-compact-monitoring` |
| `heliopause-dtn-sync` | `/api/cron/heliopause-dtn-sync` |
| `hippocampal-organoid-mesh-sync` | `/api/cron/hippocampal-organoid-mesh-sync` |
| `homomorphic-dna-federation-sync` | `/api/cron/homomorphic-dna-federation-sync` |
| `icao-imo-ai-aviation-registry-sync` | `/api/cron/icao-imo-ai-aviation-registry-sync` |
| `indo-pacific-compact-sync` | `/api/cron/indo-pacific-compact-sync` |
| `intergalactic-mesh-federation-sync` | `/api/cron/intergalactic-mesh-federation-sync` |
| `ismap-nzism-monitoring` | `/api/cron/ismap-nzism-monitoring` |
| `iso27001-quarterly-attestation` | `/api/cron/iso27001-quarterly-attestation` |
| `itu-uncitral-digital-commerce-ai-registry-sync` | `/api/cron/itu-uncitral-digital-commerce-ai-registry-sync` |
| `jupiter-trojan-dtn-lagrange-sync` | `/api/cron/jupiter-trojan-dtn-lagrange-sync` |
| `kuiper-scattered-disk-dtn-aphelion-sync` | `/api/cron/kuiper-scattered-disk-dtn-aphelion-sync` |
| `lunar-farside-dtn-mesh-sync` | `/api/cron/lunar-farside-dtn-mesh-sync` |
| `medulla-oblongata-emergency-halt-sync` | `/api/cron/medulla-oblongata-emergency-halt-sync` |
| `metaverse-finality-seal-crdt-sync` | `/api/cron/metaverse-finality-seal-crdt-sync` |
| `midbrain-arousal-publish-pacing-sync` | `/api/cron/midbrain-arousal-publish-pacing-sync` |
| `motor-cortex-execution-publish-sync` | `/api/cron/motor-cortex-execution-publish-sync` |
| `neptune-triton-retrograde-dtn-halo-sync` | `/api/cron/neptune-triton-retrograde-dtn-halo-sync` |
| `oecd-state-ag-ai-transparency-mesh-sync` | `/api/cron/oecd-state-ag-ai-transparency-mesh-sync` |
| `pan-pacific-quantum-mesh-sync` | `/api/cron/pan-pacific-quantum-mesh-sync` |
| `parallel-universe-merge-crdt-sync` | `/api/cron/parallel-universe-merge-crdt-sync` |
| `pluto-charon-binary-dtn-barycenter-sync` | `/api/cron/pluto-charon-binary-dtn-barycenter-sync` |
| `pons-autonomic-bridge-failover-sync` | `/api/cron/pons-autonomic-bridge-failover-sync` |
| `pqc-dna-archival-seal` | `/api/cron/pqc-dna-archival-seal` |
| `prefrontal-ethics-board-sync` | `/api/cron/prefrontal-ethics-board-sync` |
| `prefrontal-organoid-mesh-sync` | `/api/cron/prefrontal-organoid-mesh-sync` |
| `premotor-sma-planning-publish-sync` | `/api/cron/premotor-sma-planning-publish-sync` |
| `pspf-nz-dta-monitoring` | `/api/cron/pspf-nz-dta-monitoring` |
| `recursive-zk-dna-rollup` | `/api/cron/recursive-zk-dna-rollup` |
| `saturn-ring-dtn-shepherd-sync` | `/api/cron/saturn-ring-dtn-shepherd-sync` |
| `soci-nz-gcdo-monitoring` | `/api/cron/soci-nz-gcdo-monitoring` |
| `spinal-cord-publish-throttle-sync` | `/api/cron/spinal-cord-publish-throttle-sync` |
| `stateramp-txramp-monitoring` | `/api/cron/stateramp-txramp-monitoring` |
| `uk-ai-safety-seed` | `/api/cron/uk-ai-safety-seed` |
| `uk-dsit-algorithmic-transparency-sync` | `/api/cron/uk-dsit-algorithmic-transparency-sync` |
| `un-ai-office-global-registry-mesh-sync` | `/api/cron/un-ai-office-global-registry-mesh-sync` |
| `uranus-obliquity-dtn-polar-relay-sync` | `/api/cron/uranus-obliquity-dtn-polar-relay-sync` |
| `us-ftc-ai-transparency-live-sync` | `/api/cron/us-ftc-ai-transparency-live-sync` |
| `wto-upu-cross-border-ai-trade-registry-sync` | `/api/cron/wto-upu-cross-border-ai-trade-registry-sync` |
| `zk-dna-rollup` | `/api/cron/zk-dna-rollup` |

## Maintenance

- Regenerate: `npx tsx scripts/generate-experimental-cron-inventory-doc.ts`
- Validate: `npm run validate:cron-inventory`
- Archive: `docs/CRON_ARCHIVE_RUNBOOK.md`
