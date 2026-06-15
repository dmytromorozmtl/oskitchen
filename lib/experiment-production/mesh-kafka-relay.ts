/**
 * Galactic / intergalactic mesh relay via Kafka when configured (4.1).
 */

export type MeshRelayEvent = {
  at: string;
  storeSlug: string;
  relayType: "galactic" | "intergalactic" | "global" | "cosmic_web";
  payload: Record<string, unknown>;
};

export type EuConformityRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  conformityStatus: string;
  registrySequence: number;
};

export function isMeshKafkaRelayEnabled(): boolean {
  return (
    process.env.THEME_EXPERIMENT_MESH_KAFKA_RELAY === "1" &&
    Boolean(process.env.KAFKA_BROKERS?.trim())
  );
}

export function meshKafkaTopic(): string {
  return process.env.KAFKA_EXPERIMENT_MESH_TOPIC?.trim() || "kos.experiment.mesh.outcomes";
}

export function euConformityKafkaTopic(): string {
  return process.env.KAFKA_EU_CONFORMITY_TOPIC?.trim() || "eu-ai-conformity-events";
}

export function ukDsitKafkaTopic(): string {
  return process.env.KAFKA_UK_DSIT_TOPIC?.trim() || "uk-dsit-transparency-events";
}

export function nistRmfKafkaTopic(): string {
  return process.env.KAFKA_NIST_RMF_TOPIC?.trim() || "nist-ai-rmf-control-events";
}

export function euAiActPmmKafkaTopic(): string {
  return process.env.KAFKA_EU_AI_ACT_PMM_TOPIC?.trim() || "eu-ai-act-pmm-events";
}

export function usFtcTransparencyKafkaTopic(): string {
  return process.env.KAFKA_US_FTC_TRANSPARENCY_TOPIC?.trim() || "ftc-ai-transparency-events";
}

export function oecdStateAgTransparencyKafkaTopic(): string {
  return process.env.KAFKA_OECD_STATE_AG_TRANSPARENCY_TOPIC?.trim() || "oecd-state-ag-transparency-events";
}

export function unAiOfficeRegistryKafkaTopic(): string {
  return process.env.KAFKA_UN_AI_OFFICE_REGISTRY_TOPIC?.trim() || "un-ai-office-global-registry-events";
}

export function icaoImoAviationRegistryKafkaTopic(): string {
  return process.env.KAFKA_ICAO_IMO_AVIATION_REGISTRY_TOPIC?.trim() || "icao-imo-ai-aviation-registry-events";
}

export function wtoUpuTradeRegistryKafkaTopic(): string {
  return process.env.KAFKA_WTO_UPU_TRADE_REGISTRY_TOPIC?.trim() || "wto-upu-trade-registry-events";
}

export function ituUncitralDigitalCommerceKafkaTopic(): string {
  return (
    process.env.KAFKA_ITU_UNCITRAL_DIGITAL_COMMERCE_TOPIC?.trim() ||
    "itu-uncitral-digital-commerce-events"
  );
}

export function isoIecAiStandardsHarmonizationKafkaTopic(): string {
  return (
    process.env.KAFKA_ISO_IEC_AI_STANDARDS_HARMONIZATION_TOPIC?.trim() ||
    "iso-iec-ai-standards-harmonization-events"
  );
}

export function cenCenelecDigitalGovernanceKafkaTopic(): string {
  return (
    process.env.KAFKA_CEN_CENELEC_DIGITAL_GOVERNANCE_TOPIC?.trim() ||
    "cen-cenelec-digital-governance-events"
  );
}

export type ItuUncitralDigitalCommerceRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  bodyId: string;
  commerceRecordId: string;
};

export type IsoIecAiStandardsHarmonizationRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  bodyId: string;
  standardsRecordId: string;
};

export type CenCenelecDigitalGovernanceRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  bodyId: string;
  governanceRecordId: string;
};

export type WtoUpuTradeRegistryRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  bodyId: string;
  tradeRecordId: string;
};

export type IcaoImoAviationRegistryRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  authorityId: string;
  aviationRecordId: string;
};

export type UnAiOfficeRegistryRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  regionId: string;
  globalRecordId: string;
};

export type OecdStateAgTransparencyRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  jurisdictionId: string;
  disclosureRecordId: string;
};

export type UsFtcTransparencyRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  transparencyRecordId: string;
  consumerHarmRisk: string;
};

export type EuAiActPmmRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  incidentId: string;
  severity: string;
  status: string;
};

export type NistRmfRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  controlId: string;
  rmfFunction: string;
};

export type UkDsitRelayEvent = {
  at: string;
  storeSlug: string;
  eventId: string;
  transparencyRecordId: string;
  disclosureLevel: string;
};

/**
 * Publish mesh outcome to Kafka REST proxy or log sink.
 * Production: point KAFKA_REST_URL at Confluent REST / Redpanda HTTP proxy.
 */
export async function publishMeshRelayEvent(event: MeshRelayEvent): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = meshKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish EU conformity stream event to dedicated Kafka topic. */
export async function publishEuConformityRelayEvent(
  event: EuConformityRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = euConformityKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish UK DSIT transparency stream event to dedicated Kafka topic. */
export async function publishUkDsitRelayEvent(event: UkDsitRelayEvent): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = ukDsitKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish NIST AI RMF control stream event to dedicated Kafka topic. */
export async function publishNistRmfRelayEvent(event: NistRmfRelayEvent): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = nistRmfKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish EU AI Act Art. 71 PMM incident to dedicated Kafka topic. */
export async function publishEuAiActPmmRelayEvent(
  event: EuAiActPmmRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = euAiActPmmKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish US FTC AI transparency event to dedicated Kafka topic. */
export async function publishUsFtcTransparencyRelayEvent(
  event: UsFtcTransparencyRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = usFtcTransparencyKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish OECD / state-AG transparency mesh event to dedicated Kafka topic. */
export async function publishOecdStateAgTransparencyRelayEvent(
  event: OecdStateAgTransparencyRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = oecdStateAgTransparencyKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish ITU-T / UNCITRAL digital commerce registry event to dedicated Kafka topic. */
export async function publishItuUncitralDigitalCommerceRelayEvent(
  event: ItuUncitralDigitalCommerceRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = ituUncitralDigitalCommerceKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish ISO / IEC AI standards harmonization event to dedicated Kafka topic. */
export async function publishIsoIecAiStandardsHarmonizationRelayEvent(
  event: IsoIecAiStandardsHarmonizationRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = isoIecAiStandardsHarmonizationKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish CEN / CENELEC digital product governance event to dedicated Kafka topic. */
export async function publishCenCenelecDigitalGovernanceRelayEvent(
  event: CenCenelecDigitalGovernanceRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = cenCenelecDigitalGovernanceKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish WTO / UPU cross-border trade registry event to dedicated Kafka topic. */
export async function publishWtoUpuTradeRegistryRelayEvent(
  event: WtoUpuTradeRegistryRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = wtoUpuTradeRegistryKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish ICAO / IMO aviation registry event to dedicated Kafka topic. */
export async function publishIcaoImoAviationRegistryRelayEvent(
  event: IcaoImoAviationRegistryRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = icaoImoAviationRegistryKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}

/** Publish UN AI Office global registry event to dedicated Kafka topic. */
export async function publishUnAiOfficeRegistryRelayEvent(
  event: UnAiOfficeRegistryRelayEvent,
): Promise<{ published: boolean }> {
  if (!isMeshKafkaRelayEnabled()) {
    return { published: false };
  }

  const restUrl = process.env.KAFKA_REST_URL?.trim();
  if (!restUrl) {
    return { published: false };
  }

  const topic = unAiOfficeRegistryKafkaTopic();
  const url = `${restUrl.replace(/\/$/, "")}/topics/${encodeURIComponent(topic)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/vnd.kafka.json.v2+json",
        ...(process.env.KAFKA_REST_API_KEY
          ? { authorization: `Bearer ${process.env.KAFKA_REST_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        records: [{ value: event }],
      }),
    });
    return { published: res.ok };
  } catch {
    return { published: false };
  }
}
