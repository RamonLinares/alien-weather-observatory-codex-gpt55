import {
  createRandomSeed,
  countDiscoveries,
  makePlanet,
  makeRecoveredReadings,
} from "./planetCatalog.js";

export const STORAGE_KEY = "alien-weather-observatory:v1";
const SCHEMA_VERSION = 1;
const CODE_PREFIX = "AWO";

export function createInitialProgress() {
  return {
    schemaVersion: SCHEMA_VERSION,
    planetSeed: createRandomSeed(),
    discoveryMask: 0,
    readings: [],
    archiveCount: 0,
    updatedAt: Date.now(),
  };
}

export function sanitizeProgress(value) {
  if (!value || typeof value !== "object") {
    return createInitialProgress();
  }

  const planetSeed = Number(value.planetSeed) >>> 0;
  const discoveryMask = Number(value.discoveryMask) & 31;
  const readings = Array.isArray(value.readings) ? value.readings.slice(0, 7) : [];

  return {
    schemaVersion: SCHEMA_VERSION,
    planetSeed: planetSeed || createRandomSeed(),
    discoveryMask,
    readings,
    archiveCount: Math.max(0, Number(value.archiveCount) || 0),
    updatedAt: Number(value.updatedAt) || Date.now(),
  };
}

export function loadProgress() {
  if (typeof window === "undefined") {
    return createInitialProgress();
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? sanitizeProgress(JSON.parse(saved)) : createInitialProgress();
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(progress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeProgress(progress)));
}

function checksum(payload) {
  let hash = 2166136261;

  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36).slice(-2).toUpperCase().padStart(2, "0");
}

export function encodeRecoveryCode(progress) {
  const safe = sanitizeProgress(progress);
  const seed = safe.planetSeed.toString(36).toUpperCase();
  const mask = (safe.discoveryMask & 31).toString(36).toUpperCase();
  const archive = (safe.archiveCount || 0).toString(36).toUpperCase();
  const payload = `${seed}-${mask}-${archive}`;

  return `${CODE_PREFIX}-${payload}-${checksum(payload)}`;
}

export function decodeRecoveryCode(input) {
  const normalized = String(input || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "-");
  const parts = normalized.split("-");

  if (parts.length !== 5 || parts[0] !== CODE_PREFIX) {
    return { ok: false, error: "Use a code shaped like AWO-7K2Q-3-0-H9." };
  }

  const payload = `${parts[1]}-${parts[2]}-${parts[3]}`;
  if (checksum(payload) !== parts[4]) {
    return { ok: false, error: "That recovery code checksum does not match." };
  }

  const planetSeed = Number.parseInt(parts[1], 36);
  const discoveryMask = Number.parseInt(parts[2], 36) & 31;
  const archiveCount = Number.parseInt(parts[3], 36);

  if (!Number.isFinite(planetSeed) || planetSeed <= 0 || !Number.isFinite(discoveryMask)) {
    return { ok: false, error: "That recovery code could not be read." };
  }

  const planet = makePlanet(planetSeed);

  return {
    ok: true,
    progress: {
      schemaVersion: SCHEMA_VERSION,
      planetSeed,
      discoveryMask,
      readings: makeRecoveredReadings(planet, discoveryMask),
      archiveCount: Number.isFinite(archiveCount) ? archiveCount : 0,
      updatedAt: Date.now(),
    },
    discoveryCount: countDiscoveries(discoveryMask),
  };
}

