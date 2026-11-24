import { consumerScenarios } from "./consumerScenarios.js";

export const scenarios = consumerScenarios;

const legacyScenarioTitles = {
  hospital: "병원 접수·진료 안내",
  public: "공공기관 민원·복지 안내",
  school: "학교 상담",
  office: "복지기관 상담",
};

export const DEFAULT_PREFS = {
  textSize: "normal",
  language: "both",
  speech: true,
  retention: "24h",
  faceTracking: true,
  poseTracking: true,
  spatialTracking: true,
  confidenceAlert: true,
  confidenceThreshold: 80,
  kslEnglish: true,
  haptics: true,
  highContrast: false,
  voiceTone: "clear",
  speechRate: 0.9,
};
export const STORAGE_KEY = "modoo.frontend.v2";
export const retentionLabels = {
  none: "저장 안 함",
  "24h": "24시간",
  "7d": "7일",
  keep: "계속 보관",
};
export const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const scenarioById = (id) =>
  scenarios.find((s) => s.id === id) ?? scenarios[0];

export function getPhrases(id, overrides = {}) {
  return (
    overrides[id] ??
    scenarioById(id).phrases.map((p, i) => ({ ...p, id: `${id}-${i}` }))
  );
}

export function getEnglish(text, scenarioId, overrides = {}) {
  const normalized = text.trim();
  const found = [
    ...getPhrases(scenarioId, overrides),
    ...scenarioById(scenarioId).replies,
  ].find((p) => p.text === normalized);
  return found?.english ?? "";
}

export function pruneSessions(sessions, now = Date.now()) {
  return sessions.filter((s) => !s.expiresAt || s.expiresAt > now);
}

export function applyRetention(session, retention, now = Date.now()) {
  const duration =
    retention === "24h" ? 86400000 : retention === "7d" ? 604800000 : null;
  return { ...session, retention, expiresAt: duration ? now + duration : null };
}

export function serializableState(state, now = Date.now()) {
  return {
    ...state,
    sessions: pruneSessions(state.sessions, now).filter(
      (s) => s.retention !== "none" && s.messages.length > 0,
    ),
  };
}

export function loadState(raw, now = Date.now()) {
  const fallback = {
    prefs: { ...DEFAULT_PREFS },
    sessions: [],
    overrides: {},
    staff: [],
    situationId: "hospital",
  };
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return fallback;
    const prefs = { ...DEFAULT_PREFS };
    if (["normal", "large", "extra"].includes(data.prefs?.textSize))
      prefs.textSize = data.prefs.textSize;
    if (["ko", "en", "both"].includes(data.prefs?.language))
      prefs.language = data.prefs.language;
    if (typeof data.prefs?.speech === "boolean")
      prefs.speech = data.prefs.speech;
    if (Object.keys(retentionLabels).includes(data.prefs?.retention))
      prefs.retention = data.prefs.retention;
    for (const key of [
      "faceTracking",
      "poseTracking",
      "spatialTracking",
      "confidenceAlert",
      "kslEnglish",
      "haptics",
      "highContrast",
    ]) {
      if (typeof data.prefs?.[key] === "boolean") prefs[key] = data.prefs[key];
    }
    if (
      typeof data.prefs?.confidenceThreshold === "number" &&
      data.prefs.confidenceThreshold >= 50 &&
      data.prefs.confidenceThreshold <= 99
    )
      prefs.confidenceThreshold = data.prefs.confidenceThreshold;
    if (["clear", "calm"].includes(data.prefs?.voiceTone))
      prefs.voiceTone = data.prefs.voiceTone;
    if (
      typeof data.prefs?.speechRate === "number" &&
      [0.7, 0.9, 1.2].includes(data.prefs.speechRate)
    )
      prefs.speechRate = data.prefs.speechRate;
    const sessions = Array.isArray(data.sessions)
      ? data.sessions
          .filter(
            (s) =>
              s &&
              typeof s.id === "string" &&
              scenarios.some((c) => c.id === s.scenarioId) &&
              typeof s.createdAt === "number" &&
              Number.isFinite(s.createdAt) &&
              Array.isArray(s.messages) &&
              ["24h", "7d", "keep"].includes(s.retention) &&
              (s.retention === "keep" ||
                (typeof s.expiresAt === "number" &&
                  Number.isFinite(s.expiresAt))),
          )
          .map((s) => ({
            ...s,
            scenarioTitle: typeof s.scenarioTitle === "string"
              ? s.scenarioTitle
              : legacyScenarioTitles[s.scenarioId],
            messages: s.messages
              .filter(
                (m) =>
                  m &&
                  typeof m.id === "string" &&
                  typeof m.text === "string" &&
                  ["sign", "voice", "text"].includes(m.mode),
              )
              .map((m) => ({
                ...m,
                english: typeof m.english === "string" ? m.english : "",
              })),
          }))
      : [];
    const overrides = {};
    for (const c of scenarios) {
      if (
        Array.isArray(data.overrides?.[c.id]) &&
        data.overrides[c.id].every(
          (p) =>
            p &&
            ["id", "text", "english", "category", "subtext"].every(
              (k) => typeof p[k] === "string",
            ) &&
            p.text.trim() &&
            p.category.trim(),
        )
      )
        overrides[c.id] = data.overrides[c.id];
    }
    const staff = Array.isArray(data.staff)
      ? data.staff.filter(
          (p) =>
            p &&
            typeof p.id === "string" &&
            typeof p.name === "string" &&
            ["직원", "관리자"].includes(p.role),
        )
      : [];
    return {
      prefs,
      sessions: pruneSessions(sessions, now),
      overrides,
      staff,
      situationId: scenarioById(data.situationId).id,
    };
  } catch {
    return fallback;
  }
}
