import { NextResponse, type NextRequest } from "next/server";
import { storefrontSlugCacheTag, storefrontThemeArmCacheTag } from "@/lib/storefront/cdn-cache";
import {
  armFromHoldoutBucket,
  armFromTrafficBucket,
  armFromWeightedBucket,
  stableBucketPercent,
  THEME_EXPERIMENT_ARM_HEADER,
  THEME_EXPERIMENT_VISITOR_COOKIE,
} from "@/lib/storefront/theme-experiment-bucket";
import { isThemeExperimentEdgeEnabled } from "@/lib/storefront/theme-experiment-edge-config";
import { readThemeExperimentFromEdgeConfig } from "@/lib/storefront/theme-experiment-edge-read";
import { isThemeExperimentGloballyDisabled } from "@/lib/storefront/theme-experiment-globals";
import {
  logThemeExperimentArmAssigned,
  logThemeExperimentObservability,
  type MiddlewareArmSource,
} from "@/lib/storefront/theme-experiment-observability-edge";
import {
  createExperimentSpanId,
  ensureTraceId,
  recordExperimentSpan,
  stampExperimentTraceHeaders,
  traceIdFromHeaders,
} from "@/lib/storefront/experiment-trace";
import {
  assignArmForSegment,
  inferVisitorSegment,
  isContextualBanditEnabled,
  parseVisitorSegment,
  VISITOR_SEGMENT_COOKIE,
} from "@/lib/storefront/theme-experiment-contextual-bandit";
import {
  assignArmLinUcb,
  buildLinUcbFeatureVector,
  isLinUcbEnabled,
  readLinUcbSnapshot,
} from "@/lib/storefront/theme-experiment-linucb";
import {
  assignArmWasmKernel,
  isWasmAssignmentEnabled,
} from "@/lib/storefront/theme-experiment-wasm-assignment";
import {
  assignArmQuboKernel,
  isQuboBanditEnabled,
  shouldUseQuboBandit,
} from "@/lib/storefront/theme-experiment-qubo-bandit";
import {
  assignArmNeuromorphicKernel,
  isNeuromorphicAssignEnabled,
  shouldUseNeuromorphicAssign,
} from "@/lib/storefront/theme-experiment-neuromorphic-assign";
import { isZkAssignmentFairnessEnabled } from "@/lib/storefront/theme-experiment-zk-assignment-fairness-flags";
import {
  assignArmPhotonicKernel,
  isPhotonicAssignEnabled,
  shouldUsePhotonicAssign,
} from "@/lib/storefront/theme-experiment-photonic-assign";
import {
  assignArmBioNeuronKernel,
  isBioNeuronAssignEnabled,
  shouldUseBioNeuronAssign,
} from "@/lib/storefront/theme-experiment-bio-neuron-assign";
import {
  assignArmOrganoidKernel,
  isOrganoidWetwareEnabled,
  shouldUseOrganoidWetware,
} from "@/lib/storefront/theme-experiment-organoid-wetware";
import { isDnaAuditTrailEnabled } from "@/lib/compliance/dna-encoded-audit-trail";
import { isDtnMeshEnabled, readDtnMesh } from "@/lib/storefront/theme-experiment-dtn-mesh";
import { isWetwareCalibrationEnabled } from "@/lib/storefront/theme-experiment-wetware-calibration";
import { isPqcDnaArchivalEnabled } from "@/lib/compliance/pqc-dna-archival";
import { isCislunarDtnEnabled, readCislunarDtn } from "@/lib/storefront/theme-experiment-cislunar-dtn";
import { isHeliopauseDtnEnabled, readHeliopauseDtn } from "@/lib/storefront/theme-experiment-heliopause-dtn";
import { isHomomorphicDnaFederationEnabled } from "@/lib/compliance/homomorphic-dna-federation";
import { isZkDnaRollupEnabled } from "@/lib/compliance/zk-dna-rollup-snapshot";
import { isCorticalOrganoidMeshEnabled, readCorticalOrganoidMesh } from "@/lib/storefront/theme-experiment-cortical-organoid-mesh";
import { isGalacticMeshEnabled, readGalacticMesh } from "@/lib/storefront/theme-experiment-galactic-mesh";
import {
  isRecursiveZkDnaRollupEnabled,
  readRecursiveZkDnaRollup,
} from "@/lib/compliance/recursive-zk-dna-rollup-snapshot";
import {
  isHippocampalOrganoidMeshEnabled,
  readHippocampalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-hippocampal-organoid-mesh";
import {
  isIntergalacticMeshFederationEnabled,
  readIntergalacticMeshFederation,
} from "@/lib/storefront/theme-experiment-intergalactic-mesh-federation";
import { isFiveEyesPlusCompactEnabled } from "@/lib/compliance/five-eyes-plus-compact";
import { isEuAiOfficeContinuousConformityEnabled } from "@/lib/compliance/eu-ai-office-continuous-conformity";
import {
  isHypergraphZkDnaEnabled,
  readHypergraphZkDna,
} from "@/lib/compliance/hypergraph-zk-dna-snapshot";
import {
  isPrefrontalOrganoidMeshEnabled,
  readPrefrontalOrganoidMesh,
} from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";
import { isIndoPacificCompactEnabled, readIndoPacificCompact } from "@/lib/compliance/indo-pacific-compact";
import {
  isEuAiActLiveRegistryEnabled,
  readEuAiActLiveRegistry,
} from "@/lib/compliance/eu-ai-act-live-registry";
import {
  isCosmicWebFederationEnabled,
  readCosmicWebFederation,
} from "@/lib/storefront/theme-experiment-cosmic-web-federation";
import {
  isHypergraphEvolutionEnabled,
  readHypergraphEvolution,
} from "@/lib/compliance/hypergraph-evolution-snapshot";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import {
  isPanPacificQuantumMeshEnabled,
  panPacificMeshHeaderToken,
  readPanPacificQuantumMesh,
} from "@/lib/storefront/theme-experiment-pan-pacific-quantum-mesh";
import {
  isUkDsitAlgorithmicTransparencyEnabled,
  readUkDsitAlgorithmicTransparency,
} from "@/lib/compliance/uk-dsit-algorithmic-transparency";
import {
  isMultiverseOutcomeCrdtEnabled,
  readMultiverseOutcomeCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-outcome-crdt";
import {
  isHypergraphL3RecursiveAnchorEnabled,
  readHypergraphL3Recursive,
} from "@/lib/compliance/hypergraph-l3-recursive-anchor";
import {
  isCerebellarMotorOrganoidEnabled,
  readCerebellarMotorOrganoid,
} from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";
import {
  isArcticQuantumMeshEnabled,
  readArcticQuantumMesh,
} from "@/lib/storefront/theme-experiment-arctic-quantum-mesh";
import {
  isNistAiRmfLiveControlFeedEnabled,
  readNistAiRmfLiveControlFeed,
} from "@/lib/compliance/nist-ai-rmf-live-control-feed";
import {
  isOmniverseCausalGraphCrdtEnabled,
  readOmniverseCausalGraph,
} from "@/lib/storefront/theme-experiment-omniverse-causal-graph-crdt";
import {
  isHypergraphL4MetaAnchorEnabled,
  readHypergraphL4Meta,
} from "@/lib/compliance/hypergraph-l4-meta-anchor";
import {
  isBrainstemAutonomicGuardEnabled,
  readBrainstemAutonomicGuard,
} from "@/lib/storefront/theme-experiment-brainstem-autonomic-guard";
import {
  isAntarcticSubglacialMeshEnabled,
  readAntarcticSubglacialMesh,
} from "@/lib/storefront/theme-experiment-antarctic-subglacial-mesh";
import {
  isEuAiActArt71PmmLiveEnabled,
  readEuAiActArt71PmmLive,
} from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import {
  isMultiverseCounterfactualCrdtEnabled,
  readMultiverseCounterfactualCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-counterfactual-crdt";
import {
  isHypergraphL5CompositionalAnchorEnabled,
  readHypergraphL5Compositional,
} from "@/lib/compliance/hypergraph-l5-compositional-anchor";
import {
  isSpinalCordPublishThrottleEnabled,
  readSpinalCordPublishThrottle,
} from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import {
  isLunarFarsideDtnMeshEnabled,
  readLunarFarsideDtnMesh,
} from "@/lib/storefront/theme-experiment-lunar-farside-dtn-mesh";
import {
  isUsFtcAiTransparencyLiveEnabled,
  readUsFtcAiTransparencyLive,
} from "@/lib/compliance/us-ftc-ai-transparency-live-feed";
import {
  isParallelUniverseMergeCrdtEnabled,
  readParallelUniverseMergeCrdt,
} from "@/lib/storefront/theme-experiment-parallel-universe-merge-crdt";
import {
  isHypergraphL6HolographicAnchorEnabled,
  readHypergraphL6Holographic,
} from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import {
  isMedullaOblongataEmergencyHaltEnabled,
  readMedullaOblongataEmergencyHalt,
} from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";
import {
  isMartianOrbitalDtnRelayEnabled,
  readMartianOrbitalDtnRelay,
} from "@/lib/storefront/theme-experiment-martian-orbital-dtn-relay";
import {
  isOecdStateAgAiTransparencyMeshEnabled,
  readOecdStateAgAiTransparencyMesh,
} from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import {
  isMultiverseReconciliationCrdtEnabled,
  readMultiverseReconciliationCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-reconciliation-crdt";
import {
  isHypergraphL7EntanglementAnchorEnabled,
  readHypergraphL7Entanglement,
} from "@/lib/compliance/hypergraph-l7-entanglement-anchor";
import {
  isPonsAutonomicBridgeFailoverEnabled,
  readPonsAutonomicBridgeFailover,
} from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import {
  isJupiterTrojanDtnLagrangeEnabled,
  readJupiterTrojanDtnLagrange,
} from "@/lib/storefront/theme-experiment-jupiter-trojan-dtn-lagrange";
import {
  isUnAiOfficeGlobalRegistryMeshEnabled,
  readUnAiOfficeGlobalRegistryMesh,
} from "@/lib/compliance/un-ai-office-global-registry-mesh";
import {
  isOmniverseEpochSealCrdtEnabled,
  readOmniverseEpochSealCrdt,
} from "@/lib/storefront/theme-experiment-omniverse-epoch-seal-crdt";
import {
  isHypergraphL8FaultTolerantAnchorEnabled,
  readHypergraphL8FaultTolerant,
} from "@/lib/compliance/hypergraph-l8-fault-tolerant-anchor";
import {
  isMidbrainArousalPublishPacingEnabled,
  readMidbrainArousalPublishPacing,
} from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import {
  isSaturnRingDtnShepherdEnabled,
  readSaturnRingDtnShepherd,
} from "@/lib/storefront/theme-experiment-saturn-ring-dtn-shepherd";
import {
  isIcaoImoAiAviationRegistryEnabled,
  readIcaoImoAiAviationRegistry,
} from "@/lib/compliance/icao-imo-ai-aviation-registry";
import {
  isMetaverseFinalitySealCrdtEnabled,
  readMetaverseFinalitySealCrdt,
} from "@/lib/storefront/theme-experiment-metaverse-finality-seal-crdt";
import {
  isHypergraphL9ByzantineAnchorEnabled,
  readHypergraphL9Byzantine,
} from "@/lib/compliance/hypergraph-l9-byzantine-anchor";
import {
  isThalamusSensoryGatingPublishEnabled,
  readThalamusSensoryGatingPublish,
} from "@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish";
import {
  isUranusObliquityDtnPolarRelayEnabled,
  readUranusObliquityDtnPolarRelay,
} from "@/lib/storefront/theme-experiment-uranus-obliquity-dtn-polar-relay";
import {
  isWtoUpuCrossBorderAiTradeRegistryEnabled,
  readWtoUpuCrossBorderAiTradeRegistry,
} from "@/lib/compliance/wto-upu-cross-border-ai-trade-registry";
import {
  isMultiverseCausalityLockCrdtEnabled,
  readMultiverseCausalityLockCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-causality-lock-crdt";
import {
  isHypergraphL10QuantumResilientAnchorEnabled,
  readHypergraphL10QuantumResilient,
} from "@/lib/compliance/hypergraph-l10-quantum-resilient-anchor";
import {
  isBasalGangliaActionSelectionPublishEnabled,
  readBasalGangliaActionSelectionPublish,
} from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";
import {
  isNeptuneTritonRetrogradeDtnHaloEnabled,
  readNeptuneTritonRetrogradeDtnHalo,
} from "@/lib/storefront/theme-experiment-neptune-triton-retrograde-dtn-halo";
import {
  isItuUncitralDigitalCommerceAiRegistryEnabled,
  readItuUncitralDigitalCommerceAiRegistry,
} from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";
import {
  isOmniverseEpochFreezeCrdtEnabled,
  readOmniverseEpochFreezeCrdt,
} from "@/lib/storefront/theme-experiment-omniverse-epoch-freeze-crdt";
import {
  isHypergraphL11TopologicalFaultTolerantAnchorEnabled,
  readHypergraphL11TopologicalFaultTolerant,
} from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";
import {
  isCerebellumMotorRefinementPublishEnabled,
  readCerebellumMotorRefinementPublish,
} from "@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish";
import {
  isPlutoCharonBinaryDtnBarycenterEnabled,
  readPlutoCharonBinaryDtnBarycenter,
} from "@/lib/storefront/theme-experiment-pluto-charon-binary-dtn-barycenter";
import {
  isIsoIecAiStandardsHarmonizationRegistryEnabled,
  readIsoIecAiStandardsHarmonizationRegistry,
} from "@/lib/compliance/iso-iec-ai-standards-harmonization-registry";
import {
  isMultiverseTimelineSealCrdtEnabled,
  readMultiverseTimelineSealCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-timeline-seal-crdt";
import {
  isHypergraphL12CategoricalQuantumAnchorEnabled,
  readHypergraphL12CategoricalQuantum,
} from "@/lib/compliance/hypergraph-l12-categorical-quantum-anchor";
import {
  isMotorCortexExecutionPublishEnabled,
  readMotorCortexExecutionPublish,
} from "@/lib/storefront/theme-experiment-motor-cortex-execution-publish";
import {
  isKuiperScatteredDiskDtnAphelionEnabled,
  readKuiperScatteredDiskDtnAphelion,
} from "@/lib/storefront/theme-experiment-kuiper-scattered-disk-dtn-aphelion";
import {
  isCenCenelecDigitalProductGovernanceRegistryEnabled,
  readCenCenelecDigitalProductGovernanceRegistry,
} from "@/lib/compliance/cen-cenelec-digital-product-governance-registry";
import {
  isMultiverseBranchMergeSealCrdtEnabled,
  readMultiverseBranchMergeSealCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-branch-merge-seal-crdt";
import {
  isHypergraphL13HomotopyTypeTheoreticAnchorEnabled,
  readHypergraphL13HomotopyTypeTheoretic,
} from "@/lib/compliance/hypergraph-l13-homotopy-type-theoretic-anchor";
import {
  isPremotorSmaPlanningPublishEnabled,
  readPremotorSmaPlanningPublish,
} from "@/lib/storefront/theme-experiment-premotor-sma-planning-publish";
import { isTeeAssignEnabled } from "@/lib/storefront/theme-experiment-tee-assign";
import { readCompositionalExperiment } from "@/lib/storefront/theme-experiment-compositional-ui";
import { isEbpfTelemetryEnabled } from "@/lib/storefront/theme-experiment-ebpf-telemetry";
import {
  hybridAssignmentBucket,
  isQuantumSafeAssignmentEnabled,
} from "@/lib/storefront/theme-experiment-quantum-safe";
import {
  HOLDOUT_WS_VERSION_COOKIE,
  isHoldoutWsEnabled,
} from "@/lib/storefront/theme-experiment-holdout-ws";
import { SITE_URL } from "@/lib/constants";
import {
  readThemeExperimentDbFallbackPayload,
  readThemeExperimentJsonForStore,
} from "@/lib/storefront/theme-experiment-edge-db-fallback";
import { THEME_EXPERIMENT_COOKIE, type ThemeExperimentArm } from "@/lib/storefront/theme-experiment";
import {
  EDGE_STICKY_REGION_COOKIE,
  isPlanetScaleEdgeEnabled,
  nearestEdgeRegionForGeo,
  recordPlanetEdgeRead,
} from "@/lib/storefront/theme-experiment-edge-planet";

export const THEME_EXPERIMENT_ARM_SOURCE_HEADER = "x-kos-exp-source";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365;

function parseArmCookie(value: string | undefined): ThemeExperimentArm | null {
  if (value === "draft" || value === "published") return value;
  if (typeof value === "string" && value.length > 0 && value.length <= 64) return value as ThemeExperimentArm;
  return null;
}

function mergeIntoForwardResponse(requestHeaders: Headers, from: NextResponse): NextResponse {
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  for (const c of from.cookies.getAll()) {
    res.cookies.set(c.name, c.value);
  }
  for (const [key, value] of from.headers.entries()) {
    if (key.toLowerCase() === "set-cookie") continue;
    res.headers.append(key, value);
  }
  return res;
}

function setExperimentCookies(res: NextResponse, arm: ThemeExperimentArm, visitorId?: string) {
  res.cookies.set(THEME_EXPERIMENT_COOKIE, arm, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });
  if (visitorId) {
    res.cookies.set(THEME_EXPERIMENT_VISITOR_COOKIE, visitorId, {
      path: "/",
      maxAge: VISITOR_MAX_AGE,
      sameSite: "lax",
      httpOnly: false,
    });
  }
}

function stampExperimentCdnTags(res: NextResponse, storeSlug: string, arm: ThemeExperimentArm) {
  const tags = [storefrontSlugCacheTag(storeSlug), storefrontThemeArmCacheTag(storeSlug, arm)];
  res.headers.append("CDN-Cache-Tag", tags.join(", "));
  res.headers.append("Vary", "Cookie");
}

/**
 * Edge experiment assignment (5B): sticky cookie + deterministic bucket + arm cache tags.
 * Forwards `x-kos-theme-arm` on the request for SSR on first visit (before cookie is in RSC).
 */
export async function applyThemeExperimentEdgeMiddleware(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
): Promise<NextResponse> {
  if (!isThemeExperimentEdgeEnabled() || isThemeExperimentGloballyDisabled()) return sessionResponse;
  if (!pathname.startsWith("/s/")) return sessionResponse;
  if (pathname.includes("/checkout")) return sessionResponse;

  const slugMatch = pathname.match(/^\/s\/([^/]+)/);
  const storeSlug = slugMatch?.[1];
  if (!storeSlug) return sessionResponse;

  const edgeReadStarted = Date.now();
  const workspaceId = request.headers.get("x-kos-workspace-id")?.trim() || null;
  const geoCountry =
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? null;
  if (isPlanetScaleEdgeEnabled()) {
    const sticky = request.cookies.get(EDGE_STICKY_REGION_COOKIE)?.value;
    const region = sticky ?? nearestEdgeRegionForGeo(geoCountry);
    if (!sticky) {
      sessionResponse.cookies.set(EDGE_STICKY_REGION_COOKIE, region, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        httpOnly: false,
      });
    }
    recordPlanetEdgeRead({
      storeSlug,
      region,
      durationMs: 0,
      hit: Boolean(sticky),
    });
  }
  let edge = await readThemeExperimentFromEdgeConfig(storeSlug, workspaceId);
  if (!edge?.enabled) {
    edge = await readThemeExperimentDbFallbackPayload(storeSlug);
  }
  if (!edge?.enabled) return sessionResponse;

  const traceId = ensureTraceId(traceIdFromHeaders(request.headers));
  const parentSpanId = createExperimentSpanId();
  const requestHeaders = new Headers(request.headers);
  const existingArm = parseArmCookie(request.cookies.get(THEME_EXPERIMENT_COOKIE)?.value);

  const finishTrace = (arm: ThemeExperimentArm, source: MiddlewareArmSource) => {
    const spanId = createExperimentSpanId();
    stampExperimentTraceHeaders({
      requestHeaders,
      responseHeaders: sessionResponse.headers,
      traceId,
      spanId,
      parentSpanId,
    });
    recordExperimentSpan({
      traceId,
      spanId,
      parentSpanId,
      name: "middleware.assign_arm",
      durationMs: Date.now() - edgeReadStarted,
      fields: {
        store_slug: storeSlug,
        experiment_arm: arm,
        middleware_arm_source: source,
        edge_sync_version: edge.version,
      },
    });
  };

  if (existingArm) {
    const source: MiddlewareArmSource = "cookie";
    requestHeaders.set(THEME_EXPERIMENT_ARM_HEADER, existingArm);
    requestHeaders.set(THEME_EXPERIMENT_ARM_SOURCE_HEADER, source);
    stampExperimentCdnTags(sessionResponse, storeSlug, existingArm);
    logThemeExperimentObservability("middleware_arm", {
      storeSlug,
      middleware_arm_source: source,
      experiment_arm: existingArm,
      edge_sync_version: edge.version,
    });
    logThemeExperimentArmAssigned({
      storeSlug,
      middleware_arm_source: source,
      experiment_arm: existingArm,
      edge_sync_version: edge.version,
    });
    finishTrace(existingArm, source);
    return mergeIntoForwardResponse(requestHeaders, sessionResponse);
  }

  let visitorId = request.cookies.get(THEME_EXPERIMENT_VISITOR_COOKIE)?.value?.trim();
  const newVisitor = !visitorId;
  if (!visitorId) visitorId = crypto.randomUUID();

  const bucket = isQuantumSafeAssignmentEnabled()
    ? hybridAssignmentBucket(visitorId)
    : stableBucketPercent(visitorId);
  let arm: ThemeExperimentArm = armFromTrafficBucket(bucket, edge.trafficPercent);
  const cartCents = Number(request.cookies.get("kos_cart_value_cents")?.value ?? "0");
  const geo = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");

  const segment =
    parseVisitorSegment(request.cookies.get(VISITOR_SEGMENT_COOKIE)?.value) ??
    inferVisitorSegment({
      userAgent: request.headers.get("user-agent"),
      isReturning: !newVisitor,
    });

  if (edge.holdoutOnly) {
    arm = armFromHoldoutBucket(bucket, edge.holdoutPercent ?? edge.trafficPercent);
  } else if (
    isWasmAssignmentEnabled() ||
    isLinUcbEnabled() ||
    isQuboBanditEnabled() ||
    isNeuromorphicAssignEnabled() ||
    isPhotonicAssignEnabled() ||
    isBioNeuronAssignEnabled() ||
    isOrganoidWetwareEnabled()
  ) {
    const snap = readLinUcbSnapshot({ linucbWeights: edge.linucbWeights });
    if (
      snap &&
      (isWasmAssignmentEnabled() ||
        isQuboBanditEnabled() ||
        isNeuromorphicAssignEnabled() ||
        isPhotonicAssignEnabled() ||
        isBioNeuronAssignEnabled() ||
        isOrganoidWetwareEnabled())
    ) {
      const themeJson =
        isQuboBanditEnabled() ||
        isNeuromorphicAssignEnabled() ||
        isPhotonicAssignEnabled() ||
        isBioNeuronAssignEnabled() ||
        isOrganoidWetwareEnabled() ||
        isDtnMeshEnabled() ||
        isCislunarDtnEnabled() ||
        isHeliopauseDtnEnabled()
          ? await readThemeExperimentJsonForStore(storeSlug)
          : null;
      let usedOrganoid = false;
      let usedBio = false;
      let usedPhotonic = false;
      let usedNeuromorphic = false;
      let usedQubo = false;
      if (isOrganoidWetwareEnabled() && shouldUseOrganoidWetware(themeJson)) {
        const organoid = assignArmOrganoidKernel({
          storeSlug,
          visitorId,
          snapshot: snap,
          defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
          themeExperimentJson: themeJson ?? undefined,
        });
        arm = organoid.armId as ThemeExperimentArm;
        requestHeaders.set("x-kos-organoid-assign-us", String(organoid.durationUs));
        requestHeaders.set("x-kos-organoid-ensemble", String(organoid.ensembleSize));
        requestHeaders.set("x-kos-organoid-consensus", String(organoid.consensusStrength));
        requestHeaders.set("x-kos-organoid-variance-reduced", String(organoid.varianceReduced));
        usedOrganoid = true;
      }
      if (!usedOrganoid && isBioNeuronAssignEnabled() && shouldUseBioNeuronAssign(themeJson)) {
        const bio = assignArmBioNeuronKernel({
          storeSlug,
          visitorId,
          snapshot: snap,
          defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
          themeExperimentJson: themeJson ?? undefined,
        });
        arm = bio.armId as ThemeExperimentArm;
        requestHeaders.set("x-kos-bio-assign-us", String(bio.durationUs));
        requestHeaders.set("x-kos-bio-action-potentials", String(bio.actionPotentials));
        requestHeaders.set("x-kos-bio-synaptic-strength", String(bio.synapticStrength));
        requestHeaders.set("x-kos-bio-assign-source", bio.source);
        usedBio = true;
      }
      if (!usedBio && isPhotonicAssignEnabled() && shouldUsePhotonicAssign(themeJson)) {
        const photonic = assignArmPhotonicKernel({
          storeSlug,
          visitorId,
          snapshot: snap,
          defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
          themeExperimentJson: themeJson ?? undefined,
        });
        arm = photonic.armId as ThemeExperimentArm;
        requestHeaders.set("x-kos-photonic-assign-us", String(photonic.durationUs));
        requestHeaders.set("x-kos-photonic-power-mw", String(photonic.opticalPowerMw));
        usedPhotonic = true;
      }
      if (!usedPhotonic && isNeuromorphicAssignEnabled() && shouldUseNeuromorphicAssign(themeJson)) {
        const neuro = assignArmNeuromorphicKernel({
          storeSlug,
          visitorId,
          snapshot: snap,
          defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
          themeExperimentJson: themeJson ?? undefined,
        });
        arm = neuro.armId as ThemeExperimentArm;
        requestHeaders.set("x-kos-neuro-assign-us", String(neuro.durationUs));
        requestHeaders.set("x-kos-neuro-spikes", String(neuro.spikeCount));
        usedNeuromorphic = true;
      }
      if (!usedNeuromorphic && isQuboBanditEnabled()) {
        const comp = readCompositionalExperiment(themeJson);
        if (shouldUseQuboBandit(comp)) {
          const qubo = assignArmQuboKernel({
            storeSlug,
            visitorId,
            segment,
            geo,
            userAgent: request.headers.get("user-agent"),
            cartValueCents: cartCents,
            snapshot: snap,
            defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
            themeExperimentJson: themeJson ?? undefined,
          });
          arm = qubo.armId as ThemeExperimentArm;
          requestHeaders.set("x-kos-qubo-assign-us", String(qubo.durationUs));
          requestHeaders.set("x-kos-qubo-energy", String(qubo.quboEnergy));
          requestHeaders.set("x-kos-qubo-factorial", String(qubo.factorialCells));
          usedQubo = true;
        }
      }
      if (!usedOrganoid && !usedBio && !usedPhotonic && !usedNeuromorphic && !usedQubo) {
        if (isWasmAssignmentEnabled()) {
          const wasm = assignArmWasmKernel({
            storeSlug,
            visitorId,
            segment,
            geo,
            userAgent: request.headers.get("user-agent"),
            cartValueCents: cartCents,
            snapshot: snap,
            defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
          });
          arm = wasm.armId as ThemeExperimentArm;
          requestHeaders.set("x-kos-wasm-assign-us", String(wasm.durationUs));
          requestHeaders.set("x-kos-wasm-assign-source", wasm.source);
        } else {
          const features = buildLinUcbFeatureVector({
            segment,
            geo,
            userAgent: request.headers.get("user-agent"),
            cartValueCents: cartCents,
          });
          arm = assignArmLinUcb({
            visitorId,
            features,
            snapshot: snap,
            defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
          }) as ThemeExperimentArm;
        }
      }
    } else if (snap) {
      const features = buildLinUcbFeatureVector({
        segment,
        geo,
        userAgent: request.headers.get("user-agent"),
        cartValueCents: cartCents,
      });
      arm = assignArmLinUcb({
        visitorId,
        features,
        snapshot: snap,
        defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
      }) as ThemeExperimentArm;
    } else if (
      isContextualBanditEnabled() &&
      edge.segmentArmWeights &&
      Object.keys(edge.segmentArmWeights).length > 0
    ) {
      sessionResponse.cookies.set(VISITOR_SEGMENT_COOKIE, segment, {
        path: "/",
        maxAge: VISITOR_MAX_AGE,
        sameSite: "lax",
        httpOnly: false,
      });
      arm = assignArmForSegment({
        visitorId,
        segment,
        segmentArmWeights: edge.segmentArmWeights,
        defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
      }) as ThemeExperimentArm;
    } else if (edge.armWeights && Object.keys(edge.armWeights).length > 1) {
      arm = armFromWeightedBucket(bucket, edge.armWeights) as ThemeExperimentArm;
    } else {
      arm = armFromTrafficBucket(bucket, edge.trafficPercent);
    }
  } else if (
    isContextualBanditEnabled() &&
    edge.segmentArmWeights &&
    Object.keys(edge.segmentArmWeights).length > 0
  ) {
    sessionResponse.cookies.set(VISITOR_SEGMENT_COOKIE, segment, {
      path: "/",
      maxAge: VISITOR_MAX_AGE,
      sameSite: "lax",
      httpOnly: false,
    });
    arm = assignArmForSegment({
      visitorId,
      segment,
      segmentArmWeights: edge.segmentArmWeights,
      defaultWeights: edge.armWeights ?? { published: 50, draft: 50 },
    }) as ThemeExperimentArm;
  } else if (edge.armWeights && Object.keys(edge.armWeights).length > 1) {
    arm = armFromWeightedBucket(bucket, edge.armWeights) as ThemeExperimentArm;
  } else {
    arm = armFromTrafficBucket(bucket, edge.trafficPercent);
  }

  const source: MiddlewareArmSource = "edge";
  requestHeaders.set(THEME_EXPERIMENT_ARM_HEADER, arm);
  requestHeaders.set(THEME_EXPERIMENT_ARM_SOURCE_HEADER, source);
  setExperimentCookies(sessionResponse, arm, newVisitor ? visitorId : undefined);
  if (isHoldoutWsEnabled()) {
    const clientVer = request.cookies.get(HOLDOUT_WS_VERSION_COOKIE)?.value;
    const edgeVer = String(edge.version);
    if (clientVer !== edgeVer) {
      sessionResponse.cookies.set(HOLDOUT_WS_VERSION_COOKIE, edgeVer, {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
        httpOnly: false,
      });
      requestHeaders.set("x-kos-holdout-ws-stale", "1");
    }
  }
  stampExperimentCdnTags(sessionResponse, storeSlug, arm);
  logThemeExperimentObservability("middleware_arm", {
    storeSlug,
    middleware_arm_source: source,
    experiment_arm: arm,
    edge_sync_version: edge.version,
  });
  logThemeExperimentArmAssigned({
    storeSlug,
    middleware_arm_source: source,
    experiment_arm: arm,
    edge_sync_version: edge.version,
  });
  const assignLatencyUs = Date.now() - edgeReadStarted;
  if (isEbpfTelemetryEnabled()) {
    recordExperimentSpan({
      traceId,
      spanId: createExperimentSpanId(),
      parentSpanId,
      name: "ebpf.assign_arm",
      durationMs: assignLatencyUs / 1000,
      fields: {
        store_slug: storeSlug,
        experiment_arm: arm,
        latency_us: assignLatencyUs,
        kernel_path: "ebpf",
      },
    });
    const mwSecret = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
    if (mwSecret) {
      const origin = SITE_URL.replace(/\/$/, "");
      void fetch(`${origin}/api/internal/experiment-ebpf-sample`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kos-mw-secret": mwSecret,
        },
        body: JSON.stringify({
          storeSlug,
          arm,
          latencyUs: assignLatencyUs,
          kernelPath: "ebpf",
        }),
      }).catch(() => undefined);
    }
  }

  if (isQuantumSafeAssignmentEnabled()) {
    const mwSecret = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
    if (mwSecret) {
      const origin = SITE_URL.replace(/\/$/, "");
      void fetch(`${origin}/api/internal/experiment-quantum-seal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kos-mw-secret": mwSecret,
        },
        body: JSON.stringify({ storeSlug, visitorId }),
      }).catch(() => undefined);
    }
    requestHeaders.set("x-kos-quantum-bucket", String(bucket));
  }

  if (isZkAssignmentFairnessEnabled()) {
    const mwSecret = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
    if (mwSecret) {
      const origin = SITE_URL.replace(/\/$/, "");
      void fetch(`${origin}/api/internal/experiment-zk-proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kos-mw-secret": mwSecret,
        },
        body: JSON.stringify({ storeSlug, visitorId, armId: arm }),
      }).catch(() => undefined);
    }
    requestHeaders.set("x-kos-zk-fairness", "1");
  }

  if (isTeeAssignEnabled()) {
    const mwSecret = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
    if (mwSecret) {
      const origin = SITE_URL.replace(/\/$/, "");
      void fetch(`${origin}/api/internal/experiment-tee-attest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kos-mw-secret": mwSecret,
        },
        body: JSON.stringify({ storeSlug, visitorId, armId: arm }),
      }).catch(() => undefined);
    }
    requestHeaders.set("x-kos-tee-attest", "1");
  }

  if (isDnaAuditTrailEnabled()) {
    const mwSecret = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
    if (mwSecret) {
      const origin = SITE_URL.replace(/\/$/, "");
      void fetch(`${origin}/api/internal/experiment-dna-audit-block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kos-mw-secret": mwSecret,
        },
        body: JSON.stringify({
          storeSlug,
          eventType: "arm_assigned",
          payload: { visitorId, arm, source },
        }),
      }).catch(() => undefined);
    }
    requestHeaders.set("x-kos-dna-audit-trail", "1");
  }

  if (isDtnMeshEnabled()) {
    const dtnJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const dtn = readDtnMesh(dtnJson);
    if (dtn) {
      requestHeaders.set("x-kos-dtn-delivery-rate", String(Math.round(dtn.deliveryRate * 1000) / 1000));
      requestHeaders.set("x-kos-dtn-pending", String(dtn.pendingBundles));
      requestHeaders.set("x-kos-dtn-mesh-quorum", dtn.meshQuorumReached ? "1" : "0");
    }
    requestHeaders.set("x-kos-dtn-mesh", "1");
  }

  if (isCislunarDtnEnabled()) {
    const cisJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const cis = readCislunarDtn(cisJson);
    if (cis) {
      requestHeaders.set("x-kos-cislunar-bpv7", String(cis.bpv7Count));
      requestHeaders.set("x-kos-cislunar-p99-ms", String(cis.productionLatencyP99Ms));
    }
    requestHeaders.set("x-kos-cislunar-dtn", "1");
  }

  if (isPqcDnaArchivalEnabled()) {
    requestHeaders.set("x-kos-pqc-dna-archival", "1");
  }

  if (isHeliopauseDtnEnabled()) {
    const helioJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const helio = readHeliopauseDtn(helioJson);
    if (helio) {
      requestHeaders.set("x-kos-heliopause-pending", String(helio.pendingBundles));
      requestHeaders.set("x-kos-heliopause-ttl-days", String(Math.round(helio.maxTtlMs / 86400000)));
    }
    requestHeaders.set("x-kos-heliopause-dtn", "1");
  }

  if (isHomomorphicDnaFederationEnabled()) {
    requestHeaders.set("x-kos-homomorphic-dna-federation", "1");
  }

  if (isZkDnaRollupEnabled()) {
    requestHeaders.set("x-kos-zk-dna-rollup", "1");
  }

  if (isCorticalOrganoidMeshEnabled()) {
    const cortJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const cort = readCorticalOrganoidMesh(cortJson);
    if (cort) {
      requestHeaders.set("x-kos-cortical-mesh-nodes", String(cort.nodes.length));
      requestHeaders.set("x-kos-cortical-mesh-synced", cort.meshSynced ? "1" : "0");
    }
    requestHeaders.set("x-kos-cortical-organoid-mesh", "1");
  }

  if (isGalacticMeshEnabled()) {
    const galJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const gal = readGalacticMesh(galJson);
    if (gal) {
      requestHeaders.set("x-kos-galactic-relays", String(gal.intergalacticQuorum));
    }
    requestHeaders.set("x-kos-galactic-mesh", "1");
  }

  if (isRecursiveZkDnaRollupEnabled()) {
    const rzJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const rz = readRecursiveZkDnaRollup(rzJson);
    if (rz) {
      requestHeaders.set("x-kos-recursive-zk-batches", String(rz.batches.length));
    }
    requestHeaders.set("x-kos-recursive-zk-dna-rollup", "1");
  }

  if (isHippocampalOrganoidMeshEnabled()) {
    const hipJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const hip = readHippocampalOrganoidMesh(hipJson);
    if (hip) {
      requestHeaders.set("x-kos-hippocampal-windows", String(hip.activeWindowCount));
      requestHeaders.set("x-kos-hippocampal-synced", hip.hippocampalSynced ? "1" : "0");
    }
    requestHeaders.set("x-kos-hippocampal-organoid-mesh", "1");
  }

  if (isIntergalacticMeshFederationEnabled()) {
    const igJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const ig = readIntergalacticMeshFederation(igJson);
    if (ig) {
      requestHeaders.set("x-kos-laniakea-clusters", String(ig.superclusterQuorum));
      requestHeaders.set("x-kos-wormhole-slo-met", ig.wormholeSloMet ? "1" : "0");
    }
    requestHeaders.set("x-kos-intergalactic-mesh", "1");
  }

  if (isFiveEyesPlusCompactEnabled()) {
    requestHeaders.set("x-kos-five-eyes-plus-compact", "1");
  }

  if (isEuAiOfficeContinuousConformityEnabled()) {
    requestHeaders.set("x-kos-eu-continuous-conformity", "1");
  }

  if (isHypergraphZkDnaEnabled()) {
    const hgJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const hg = readHypergraphZkDna(hgJson);
    if (hg) {
      requestHeaders.set("x-kos-hypergraph-dag-nodes", String(hg.nodes.length));
    }
    requestHeaders.set("x-kos-hypergraph-zk-dna", "1");
  }

  if (isPrefrontalOrganoidMeshEnabled()) {
    const pfcJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const pfc = readPrefrontalOrganoidMesh(pfcJson);
    if (pfc) {
      requestHeaders.set("x-kos-prefrontal-go-rate", String(Math.round(pfc.goRate * 100)));
      requestHeaders.set("x-kos-prefrontal-synced", pfc.prefrontalSynced ? "1" : "0");
    }
    requestHeaders.set("x-kos-prefrontal-organoid-mesh", "1");
  }

  if (isIndoPacificCompactEnabled()) {
    const ipJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const ip = readIndoPacificCompact(ipJson);
    if (ip?.evidence.indoPacificReady) {
      requestHeaders.set("x-kos-indo-pacific-ready", "1");
    }
    requestHeaders.set("x-kos-indo-pacific-compact", "1");
  }

  if (isEuAiActLiveRegistryEnabled()) {
    const euJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const eu = readEuAiActLiveRegistry(euJson);
    if (eu?.liveRegistryReady) {
      requestHeaders.set("x-kos-eu-live-registry-ready", "1");
    }
    requestHeaders.set("x-kos-eu-ai-act-live-registry", "1");
  }

  if (isCosmicWebFederationEnabled()) {
    const cwJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const cw = readCosmicWebFederation(cwJson);
    if (cw) {
      requestHeaders.set("x-kos-cosmic-filament-quorum", String(cw.filamentQuorum));
      requestHeaders.set("x-kos-cosmic-wormhole-slo", cw.wormholeSloMet ? "1" : "0");
    }
    requestHeaders.set("x-kos-cosmic-web-federation", "1");
  }

  if (isHypergraphEvolutionEnabled()) {
    const evoJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const evo = readHypergraphEvolution(evoJson);
    if (evo?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l2-anchor", evo.latestAnchorId);
    }
    requestHeaders.set("x-kos-hypergraph-evolution", "1");
  }

  if (isPrefrontalEthicsBoardEnabled()) {
    const ethJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const eth = readPrefrontalEthicsBoard(ethJson);
    if (eth) {
      requestHeaders.set("x-kos-ethics-pending", String(eth.pendingCount));
      requestHeaders.set("x-kos-ethics-veto", eth.publishVetoActive ? "1" : "0");
    }
    requestHeaders.set("x-kos-prefrontal-ethics-board", "1");
  }

  if (isPanPacificQuantumMeshEnabled()) {
    const ppJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const pp = readPanPacificQuantumMesh(ppJson);
    if (pp?.quorumReached) {
      requestHeaders.set("x-kos-pan-pacific-quantum-mesh", "1");
      requestHeaders.set("x-kos-tasman-relay-token", panPacificMeshHeaderToken(ppJson));
    }
  }

  if (isUkDsitAlgorithmicTransparencyEnabled()) {
    const ukJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const uk = readUkDsitAlgorithmicTransparency(ukJson);
    if (uk?.dsitFeedReady) {
      requestHeaders.set("x-kos-uk-dsit-feed-ready", "1");
    }
    requestHeaders.set("x-kos-uk-dsit-algorithmic-transparency", "1");
  }

  if (isMultiverseOutcomeCrdtEnabled()) {
    const mvJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const mv = readMultiverseOutcomeCrdt(mvJson);
    if (mv?.collapsedArmId) {
      requestHeaders.set("x-kos-multiverse-collapsed-arm", mv.collapsedArmId);
    }
    requestHeaders.set("x-kos-multiverse-outcome-crdt", "1");
  }

  if (isHypergraphL3RecursiveAnchorEnabled()) {
    const l3Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l3 = readHypergraphL3Recursive(l3Json);
    if (l3?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l3-anchor", l3.latestAnchorId);
    }
    requestHeaders.set("x-kos-hypergraph-l3-recursive", "1");
  }

  if (isCerebellarMotorOrganoidEnabled()) {
    const cbJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const cb = readCerebellarMotorOrganoid(cbJson);
    if (cb) {
      requestHeaders.set("x-kos-cerebellar-reflex", cb.latestReflex ?? "hold");
      requestHeaders.set("x-kos-cerebellar-block", cb.reflexPublishBlocked ? "1" : "0");
    }
  }

  if (isArcticQuantumMeshEnabled()) {
    const arJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const ar = readArcticQuantumMesh(arJson);
    if (ar?.quorumReached) {
      requestHeaders.set("x-kos-arctic-quantum-mesh", "1");
      requestHeaders.set("x-kos-greenland-iceland-relay", String(ar.relayQuorum));
    }
  }

  if (isNistAiRmfLiveControlFeedEnabled()) {
    const nistJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const nist = readNistAiRmfLiveControlFeed(nistJson);
    if (nist?.liveControlFeedReady) {
      requestHeaders.set("x-kos-nist-rmf-live-feed", "1");
    }
    requestHeaders.set("x-kos-nist-rmf-stream-lag-ms", String(nist?.streamLagMs ?? 0));
  }

  if (isOmniverseCausalGraphCrdtEnabled()) {
    const omJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const om = readOmniverseCausalGraph(omJson);
    if (om?.dagAcyclic) {
      requestHeaders.set("x-kos-omniverse-causal-graph", "1");
      requestHeaders.set("x-kos-omniverse-lift-pp", om.mergedLiftPp.toFixed(2));
    }
  }

  if (isHypergraphL4MetaAnchorEnabled()) {
    const l4Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l4 = readHypergraphL4Meta(l4Json);
    if (l4?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l4-anchor", l4.latestAnchorId);
    }
    requestHeaders.set("x-kos-hypergraph-l4-meta", l4?.l4Ready ? "1" : "0");
  }

  if (isBrainstemAutonomicGuardEnabled()) {
    const bsJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const bs = readBrainstemAutonomicGuard(bsJson);
    if (bs) {
      requestHeaders.set("x-kos-brainstem-reflex", bs.latestReflex ?? "vagal_hold");
      requestHeaders.set("x-kos-brainstem-block", bs.autonomicPublishBlocked ? "1" : "0");
    }
  }

  if (isAntarcticSubglacialMeshEnabled()) {
    const sgJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const sg = readAntarcticSubglacialMesh(sgJson);
    if (sg?.quorumReached) {
      requestHeaders.set("x-kos-antarctic-subglacial-mesh", "1");
      requestHeaders.set("x-kos-mcmurdo-palmer-relay", String(sg.relayQuorum));
    }
  }

  if (isEuAiActArt71PmmLiveEnabled()) {
    const pmmJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const pmm = readEuAiActArt71PmmLive(pmmJson);
    if (pmm) {
      requestHeaders.set("x-kos-eu-art71-pmm-ready", pmm.pmmFeedReady ? "1" : "0");
      requestHeaders.set("x-kos-eu-art71-serious-open", String(pmm.openSeriousIncidents));
    }
  }

  if (isMultiverseCounterfactualCrdtEnabled()) {
    const cfJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const cf = readMultiverseCounterfactualCrdt(cfJson);
    if (cf?.quorumReached) {
      requestHeaders.set("x-kos-counterfactual-crdt", "1");
      requestHeaders.set("x-kos-what-if-lift-pp", cf.mergedWhatIfLiftPp.toFixed(2));
    }
  }

  if (isHypergraphL5CompositionalAnchorEnabled()) {
    const l5Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l5 = readHypergraphL5Compositional(l5Json);
    if (l5?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l5-anchor", l5.latestAnchorId);
    }
    requestHeaders.set("x-kos-hypergraph-l5-compositional", l5?.l5Ready ? "1" : "0");
  }

  if (isSpinalCordPublishThrottleEnabled()) {
    const spJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const sp = readSpinalCordPublishThrottle(spJson);
    if (sp) {
      requestHeaders.set("x-kos-spinal-throttle-ms", String(sp.throttleMs));
      requestHeaders.set("x-kos-spinal-publish-blocked", sp.publishThrottled ? "1" : "0");
    }
  }

  if (isLunarFarsideDtnMeshEnabled()) {
    const lunarJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const lunar = readLunarFarsideDtnMesh(lunarJson);
    if (lunar?.quorumReached) {
      requestHeaders.set("x-kos-lunar-farside-dtn", "1");
    }
  }

  if (isUsFtcAiTransparencyLiveEnabled()) {
    const ftcJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const ftc = readUsFtcAiTransparencyLive(ftcJson);
    if (ftc) {
      requestHeaders.set("x-kos-us-ftc-transparency-live", ftc.ftcFeedReady ? "1" : "0");
    }
  }

  if (isParallelUniverseMergeCrdtEnabled()) {
    const puJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const pu = readParallelUniverseMergeCrdt(puJson);
    if (pu?.quorumReached) {
      requestHeaders.set("x-kos-parallel-universe-merge", "1");
    }
  }

  if (isHypergraphL6HolographicAnchorEnabled()) {
    const l6Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l6 = readHypergraphL6Holographic(l6Json);
    if (l6?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l6-anchor", l6.latestAnchorId);
    }
  }

  if (isMedullaOblongataEmergencyHaltEnabled()) {
    const medJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const med = readMedullaOblongataEmergencyHalt(medJson);
    if (med?.publishEmergencyBlocked) {
      requestHeaders.set("x-kos-medulla-emergency-halt", "1");
    }
  }

  if (isMartianOrbitalDtnRelayEnabled()) {
    const marsJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const mars = readMartianOrbitalDtnRelay(marsJson);
    if (mars?.quorumReached) {
      requestHeaders.set("x-kos-martian-orbital-dtn", "1");
    }
  }

  if (isOecdStateAgAiTransparencyMeshEnabled()) {
    const oecdJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const oecd = readOecdStateAgAiTransparencyMesh(oecdJson);
    if (oecd) {
      requestHeaders.set("x-kos-oecd-transparency-mesh", oecd.meshFeedReady ? "1" : "0");
    }
  }

  if (isMultiverseReconciliationCrdtEnabled()) {
    const recJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const rec = readMultiverseReconciliationCrdt(recJson);
    if (rec?.divergentBranchesCollapsed) {
      requestHeaders.set("x-kos-multiverse-reconciled", "1");
    }
  }

  if (isHypergraphL7EntanglementAnchorEnabled()) {
    const l7Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l7 = readHypergraphL7Entanglement(l7Json);
    if (l7?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l7-anchor", l7.latestAnchorId);
    }
  }

  if (isPonsAutonomicBridgeFailoverEnabled()) {
    const ponsJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const pons = readPonsAutonomicBridgeFailover(ponsJson);
    if (pons?.gracefulDegradeActive) {
      requestHeaders.set("x-kos-pons-failover-mode", "graceful_degrade");
      requestHeaders.set("x-kos-pons-throttle-ms", String(pons.spinalThrottleMs));
    }
  }

  if (isJupiterTrojanDtnLagrangeEnabled()) {
    const jupJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const jup = readJupiterTrojanDtnLagrange(jupJson);
    if (jup?.quorumReached) {
      requestHeaders.set("x-kos-jupiter-trojan-lagrange", "1");
    }
  }

  if (isUnAiOfficeGlobalRegistryMeshEnabled()) {
    const unJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const un = readUnAiOfficeGlobalRegistryMesh(unJson);
    if (un) {
      requestHeaders.set("x-kos-un-ai-office-registry", un.globalRegistryReady ? "1" : "0");
    }
  }

  if (isOmniverseEpochSealCrdtEnabled()) {
    const epochJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const epoch = readOmniverseEpochSealCrdt(epochJson);
    if (epoch?.omniverseEpochSealed) {
      requestHeaders.set("x-kos-omniverse-epoch-sealed", "1");
    }
  }

  if (isHypergraphL8FaultTolerantAnchorEnabled()) {
    const l8Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l8 = readHypergraphL8FaultTolerant(l8Json);
    if (l8?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l8-anchor", l8.latestAnchorId);
    }
  }

  if (isThalamusSensoryGatingPublishEnabled()) {
    const thalJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const thal = readThalamusSensoryGatingPublish(thalJson);
    if (thal) {
      requestHeaders.set("x-kos-thalamus-sensory-gate", thal.sensoryGateOpen ? "open" : "closed");
    }
  }

  if (isMidbrainArousalPublishPacingEnabled()) {
    const midJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const mid = readMidbrainArousalPublishPacing(midJson);
    if (mid && !mid.pacingNominal) {
      requestHeaders.set("x-kos-midbrain-dynamic-pacing-ms", String(mid.dynamicPacingMs));
    }
  }

  if (isSaturnRingDtnShepherdEnabled()) {
    const ringJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const ring = readSaturnRingDtnShepherd(ringJson);
    if (ring?.quorumReached) {
      requestHeaders.set("x-kos-saturn-ring-shepherd", "1");
    }
  }

  if (isIcaoImoAiAviationRegistryEnabled()) {
    const avJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const av = readIcaoImoAiAviationRegistry(avJson);
    if (av) {
      requestHeaders.set("x-kos-icao-imo-aviation-registry", av.aviationRegistryReady ? "1" : "0");
    }
  }

  if (isMetaverseFinalitySealCrdtEnabled()) {
    const finJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const fin = readMetaverseFinalitySealCrdt(finJson);
    if (fin?.metaverseFinalitySealed) {
      requestHeaders.set("x-kos-metaverse-finality-sealed", "1");
    }
  }

  if (isHypergraphL9ByzantineAnchorEnabled()) {
    const l9Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l9 = readHypergraphL9Byzantine(l9Json);
    if (l9?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l9-anchor", l9.latestAnchorId);
    }
  }

  if (isUranusObliquityDtnPolarRelayEnabled()) {
    const urJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const ur = readUranusObliquityDtnPolarRelay(urJson);
    if (ur?.quorumReached) {
      requestHeaders.set("x-kos-uranus-polar-relay", "1");
    }
  }

  if (isWtoUpuCrossBorderAiTradeRegistryEnabled()) {
    const trJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const tr = readWtoUpuCrossBorderAiTradeRegistry(trJson);
    if (tr) {
      requestHeaders.set("x-kos-wto-upu-trade-registry", tr.tradeRegistryReady ? "1" : "0");
    }
  }

  if (isMultiverseCausalityLockCrdtEnabled()) {
    const lockJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const lock = readMultiverseCausalityLockCrdt(lockJson);
    if (lock?.multiverseCausalityLocked) {
      requestHeaders.set("x-kos-multiverse-causality-locked", "1");
    }
  }

  if (isHypergraphL10QuantumResilientAnchorEnabled()) {
    const l10Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l10 = readHypergraphL10QuantumResilient(l10Json);
    if (l10?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l10-anchor", l10.latestAnchorId);
    }
  }

  if (isBasalGangliaActionSelectionPublishEnabled()) {
    const bgJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const bg = readBasalGangliaActionSelectionPublish(bgJson);
    if (bg) {
      requestHeaders.set("x-kos-basal-ganglia-action", bg.selectedAction);
    }
  }

  if (isNeptuneTritonRetrogradeDtnHaloEnabled()) {
    const nepJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const nep = readNeptuneTritonRetrogradeDtnHalo(nepJson);
    if (nep?.quorumReached) {
      requestHeaders.set("x-kos-neptune-triton-halo", "1");
    }
  }

  if (isItuUncitralDigitalCommerceAiRegistryEnabled()) {
    const comJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const com = readItuUncitralDigitalCommerceAiRegistry(comJson);
    if (com) {
      requestHeaders.set("x-kos-itu-uncitral-commerce-registry", com.commerceRegistryReady ? "1" : "0");
    }
  }

  if (isOmniverseEpochFreezeCrdtEnabled()) {
    const frzJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const frz = readOmniverseEpochFreezeCrdt(frzJson);
    if (frz?.omniverseEpochFrozen) {
      requestHeaders.set("x-kos-omniverse-epoch-frozen", "1");
    }
  }

  if (isHypergraphL11TopologicalFaultTolerantAnchorEnabled()) {
    const l11Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l11 = readHypergraphL11TopologicalFaultTolerant(l11Json);
    if (l11?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l11-anchor", l11.latestAnchorId);
    }
  }

  if (isCerebellumMotorRefinementPublishEnabled()) {
    const cbJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const cb = readCerebellumMotorRefinementPublish(cbJson);
    if (cb) {
      requestHeaders.set("x-kos-cerebellum-refinement-phase", cb.refinementPhase);
    }
  }

  if (isPlutoCharonBinaryDtnBarycenterEnabled()) {
    const plutoJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const pluto = readPlutoCharonBinaryDtnBarycenter(plutoJson);
    if (pluto?.quorumReached) {
      requestHeaders.set("x-kos-pluto-charon-barycenter", "1");
    }
  }

  if (isIsoIecAiStandardsHarmonizationRegistryEnabled()) {
    const stdJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const std = readIsoIecAiStandardsHarmonizationRegistry(stdJson);
    if (std) {
      requestHeaders.set("x-kos-iso-iec-standards-registry", std.standardsRegistryReady ? "1" : "0");
    }
  }

  if (isMultiverseTimelineSealCrdtEnabled()) {
    const tlJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const tl = readMultiverseTimelineSealCrdt(tlJson);
    if (tl?.multiverseTimelineSealed) {
      requestHeaders.set("x-kos-multiverse-timeline-sealed", "1");
    }
  }

  if (isHypergraphL12CategoricalQuantumAnchorEnabled()) {
    const l12Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l12 = readHypergraphL12CategoricalQuantum(l12Json);
    if (l12?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l12-anchor", l12.latestAnchorId);
    }
  }

  if (isMotorCortexExecutionPublishEnabled()) {
    const mcJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const mc = readMotorCortexExecutionPublish(mcJson);
    if (mc) {
      requestHeaders.set("x-kos-motor-cortex-execution-mode", mc.executionMode);
    }
  }

  if (isKuiperScatteredDiskDtnAphelionEnabled()) {
    const kuiperJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const kuiper = readKuiperScatteredDiskDtnAphelion(kuiperJson);
    if (kuiper?.quorumReached) {
      requestHeaders.set("x-kos-kuiper-aphelion", "1");
    }
  }

  if (isCenCenelecDigitalProductGovernanceRegistryEnabled()) {
    const govJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const gov = readCenCenelecDigitalProductGovernanceRegistry(govJson);
    if (gov) {
      requestHeaders.set("x-kos-cen-cenelec-governance-registry", gov.governanceRegistryReady ? "1" : "0");
    }
  }

  if (isMultiverseBranchMergeSealCrdtEnabled()) {
    const bmJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const bm = readMultiverseBranchMergeSealCrdt(bmJson);
    if (bm?.multiverseBranchMergeSealed) {
      requestHeaders.set("x-kos-multiverse-branch-merge-sealed", "1");
    }
  }

  if (isHypergraphL13HomotopyTypeTheoreticAnchorEnabled()) {
    const l13Json = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const l13 = readHypergraphL13HomotopyTypeTheoretic(l13Json);
    if (l13?.latestAnchorId) {
      requestHeaders.set("x-kos-hypergraph-l13-anchor", l13.latestAnchorId);
    }
  }

  if (isPremotorSmaPlanningPublishEnabled()) {
    const pmJson = await readThemeExperimentJsonForStore(storeSlug).catch(() => null);
    const pm = readPremotorSmaPlanningPublish(pmJson);
    if (pm) {
      requestHeaders.set("x-kos-premotor-sma-planning-mode", pm.planningMode);
    }
  }

  if (isWetwareCalibrationEnabled()) {
    const mwSecret = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
    if (mwSecret) {
      const origin = SITE_URL.replace(/\/$/, "");
      void fetch(`${origin}/api/internal/experiment-wetware-calibrate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kos-mw-secret": mwSecret,
        },
        body: JSON.stringify({
          storeSlug,
          armId: arm,
          converted: false,
          liftSignal: 0,
        }),
      }).catch(() => undefined);
    }
    requestHeaders.set("x-kos-wetware-calibration", "1");
  }

  finishTrace(arm, source);

  return mergeIntoForwardResponse(requestHeaders, sessionResponse);
}
