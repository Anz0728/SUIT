const phrase = (category, text, english, subtext) => ({
  category,
  text,
  english,
  subtext,
});
export const scenarios = [
  {
    id: "hospital",
    title: "병원 접수·진료 안내",
    accent: "mint",
    iconName: "HeartPulse",
    description: "접수, 예약 확인, 기초 문진, 대기 안내 표현",
    headline: ["접수하러 왔어요,", "이 한마디부터 쉬워지도록."],
    intro: "접수부터 진료 안내까지, 필요한 말과 다음 확인사항을 함께 준비해요.",
    partner: "접수 직원",
    organization: "병원 접수팀",
    signHint: "예약 여부와 불편한 곳을 짧은 문장으로 전해 보세요.",
    heroSign: "예약하고 왔어요.",
    heroVoice: "접수를 도와드릴게요.",
    phrases: [
      phrase(
        "접수",
        "접수하러 왔어요.",
        "I would like to check in.",
        "처음 접수 창구에 도착했을 때",
      ),
      phrase(
        "예약",
        "예약하고 왔어요.",
        "I have an appointment.",
        "예약 여부를 알릴 때",
      ),
      phrase(
        "증상",
        "머리가 아파요.",
        "I have a headache.",
        "불편한 증상을 설명할 때",
      ),
      phrase(
        "증상",
        "배가 아파요.",
        "I have a stomachache.",
        "불편한 부위를 말할 때",
      ),
      phrase(
        "안내",
        "어디에서 기다리면 되나요?",
        "Where should I wait?",
        "대기 장소를 물을 때",
      ),
      phrase(
        "안내",
        "수어 통역이 필요해요.",
        "I need a sign language interpreter.",
        "진료 중 통역 도움을 요청할 때",
      ),
      phrase(
        "예약",
        "예약 시간을 확인하고 싶어요.",
        "I would like to check my appointment time.",
        "진료 시간을 확인할 때",
      ),
      phrase(
        "접수",
        "신분증 여기 있어요.",
        "Here is my ID.",
        "접수에 필요한 신분증을 건넬 때",
      ),
    ],
    replies: [
      {
        text: "예약하신 성함을 알려주시겠어요?",
        english: "May I have the name on your appointment?",
      },
      {
        text: "신분증을 보여주시겠어요?",
        english: "Could you show me your ID?",
      },
      {
        text: "대기실에서 잠시 기다려 주세요.",
        english: "Please wait in the waiting room.",
      },
      {
        text: "어디가 불편하신가요?",
        english: "What symptoms are you experiencing?",
      },
    ],
  },
  {
    id: "school",
    title: "학교 상담 · 확장 예정",
    accent: "yellow",
    iconName: "GraduationCap",
    description: "MVP 이후 교육기관으로 확장할 때 필요한 표현",
    headline: ["교실 안의 작은 질문도,", "마음 놓고 나눌 수 있도록."],
    intro: "수업과 상담, 학교에서 궁금한 이야기를 전해 보세요.",
    partner: "선생님",
    organization: "학교 상담실",
    signHint: "상담 일정이나 수업 중 궁금한 내용을 전해 보세요.",
    heroSign: "상담을 신청하고 싶어요.",
    heroVoice: "편하게 이야기해 주세요.",
    phrases: [
      phrase(
        "상담",
        "상담을 신청하고 싶어요.",
        "I would like to request a consultation.",
        "선생님과 상담을 잡을 때",
      ),
      phrase(
        "수업",
        "다시 설명해 주세요.",
        "Could you explain that again?",
        "수업 내용을 다시 확인할 때",
      ),
      phrase(
        "출결",
        "결석 사유서를 제출하려고 해요.",
        "I would like to submit an absence note.",
        "출결 서류를 제출할 때",
      ),
      phrase(
        "수업",
        "과제 제출일이 언제인가요?",
        "When is the assignment due?",
        "과제 일정을 확인할 때",
      ),
      phrase(
        "상담",
        "상담 시간을 바꿀 수 있나요?",
        "Can I reschedule the consultation?",
        "상담 일정을 변경할 때",
      ),
      phrase(
        "안내",
        "교무실이 어디인가요?",
        "Where is the teachers’ office?",
        "학교 시설을 찾을 때",
      ),
      phrase(
        "안내",
        "수업에 문자 지원이 필요해요.",
        "I need text support during class.",
        "수업 접근성 지원을 요청할 때",
      ),
      phrase(
        "출결",
        "오늘 조금 늦을 것 같아요.",
        "I think I will be a little late today.",
        "지각을 미리 알릴 때",
      ),
    ],
    replies: [
      {
        text: "어떤 내용으로 상담하고 싶나요?",
        english: "What would you like to discuss?",
      },
      {
        text: "수요일 오후에 상담할 수 있어요.",
        english: "We can meet on Wednesday afternoon.",
      },
      {
        text: "과제는 금요일까지 제출해 주세요.",
        english: "Please submit the assignment by Friday.",
      },
      {
        text: "모르는 부분은 다시 설명해 드릴게요.",
        english: "I will explain anything that is unclear again.",
      },
    ],
  },
  {
    id: "public",
    title: "공공기관 민원·복지 안내",
    accent: "blue",
    iconName: "Landmark",
    description: "서류 발급, 민원 신청, 담당 창구, 후속 서류 안내",
    headline: ["복잡했던 민원 절차도,", "한 문장씩 쉽게, 함께."],
    intro: "필요한 서류와 담당 창구, 남은 절차를 함께 확인해요.",
    partner: "민원 담당자",
    organization: "공공기관 민원실",
    signHint: "발급받을 서류나 신청하려는 민원을 전해 보세요.",
    heroSign: "등본을 발급받고 싶어요.",
    heroVoice: "필요한 서류를 안내할게요.",
    phrases: [
      phrase(
        "서류",
        "등본을 발급받고 싶어요.",
        "I would like a copy of my resident registration.",
        "주민등록등본 발급을 요청할 때",
      ),
      phrase(
        "신청",
        "전입신고를 하려고 해요.",
        "I would like to report a change of address.",
        "주소 이전을 신고할 때",
      ),
      phrase(
        "안내",
        "어느 창구로 가면 되나요?",
        "Which counter should I go to?",
        "담당 창구를 찾을 때",
      ),
      phrase(
        "서류",
        "어떤 서류가 필요한가요?",
        "What documents do I need?",
        "준비 서류를 확인할 때",
      ),
      phrase(
        "신청",
        "신청서 작성을 도와주세요.",
        "Please help me fill out the application.",
        "신청서 작성 도움을 요청할 때",
      ),
      phrase(
        "발급",
        "수수료가 얼마인가요?",
        "How much is the fee?",
        "발급 수수료를 물을 때",
      ),
      phrase(
        "발급",
        "언제 받을 수 있나요?",
        "When can I collect it?",
        "서류 발급 시점을 확인할 때",
      ),
      phrase(
        "안내",
        "번호표를 어디서 뽑나요?",
        "Where can I get a queue ticket?",
        "대기 순번을 받을 때",
      ),
    ],
    replies: [
      {
        text: "신분증을 먼저 보여주시겠어요?",
        english: "Could you show me your ID first?",
      },
      {
        text: "신청서에 성함과 주소를 적어 주세요.",
        english: "Please write your name and address on the application.",
      },
      {
        text: "3번 창구에서 안내해 드릴게요.",
        english: "We will assist you at counter three.",
      },
      {
        text: "서류가 준비되면 번호를 불러드릴게요.",
        english: "We will call your number when the document is ready.",
      },
    ],
  },
  {
    id: "office",
    title: "복지기관 상담 · 확장 예정",
    accent: "green",
    iconName: "Building2",
    description: "MVP 이후 복지 상담과 지원 신청으로 확장할 표현",
    headline: ["함께 일하는 하루에도,", "필요한 지원을 찾을 때에도."],
    intro: "근무 이야기부터 복지 상담까지, 내 생각을 또렷하게 전해요.",
    partner: "담당자",
    organization: "직장·복지 지원팀",
    signHint: "근무 일정이나 필요한 지원을 짧게 전해 보세요.",
    heroSign: "복지 상담을 받고 싶어요.",
    heroVoice: "필요한 지원을 알려주세요.",
    phrases: [
      phrase(
        "복지",
        "복지 상담을 받고 싶어요.",
        "I would like a welfare consultation.",
        "지원 상담을 요청할 때",
      ),
      phrase(
        "근무",
        "근무 일정을 확인하고 싶어요.",
        "I would like to check my work schedule.",
        "출근 일정을 확인할 때",
      ),
      phrase(
        "회의",
        "회의 내용을 글로 공유해 주세요.",
        "Please share the meeting notes in writing.",
        "회의 내용을 확인할 때",
      ),
      phrase(
        "신청",
        "지원 신청은 어떻게 하나요?",
        "How can I apply for support?",
        "지원 절차를 물을 때",
      ),
      phrase(
        "근무",
        "업무 내용을 다시 알려주세요.",
        "Please explain the task again.",
        "업무 안내를 확인할 때",
      ),
      phrase(
        "복지",
        "제가 받을 수 있는 지원이 있나요?",
        "Is there any support available to me?",
        "이용 가능한 지원을 물을 때",
      ),
      phrase(
        "신청",
        "필요한 서류를 알려주세요.",
        "Please tell me what documents I need.",
        "신청 준비를 할 때",
      ),
      phrase(
        "회의",
        "문자 통역을 이용하고 싶어요.",
        "I would like to use live captioning.",
        "회의 접근성을 요청할 때",
      ),
    ],
    replies: [
      {
        text: "어떤 지원이 필요하신가요?",
        english: "What kind of support do you need?",
      },
      {
        text: "다음 주 근무표를 확인해 드릴게요.",
        english: "I will check next week’s work schedule for you.",
      },
      {
        text: "신청서를 함께 작성해 볼까요?",
        english: "Shall we fill out the application together?",
      },
      {
        text: "회의 내용을 문서로 보내드릴게요.",
        english: "I will send you the meeting notes in writing.",
      },
    ],
  },
];

export const DEFAULT_PREFS = {
  textSize: "normal",
  language: "both",
  speech: true,
  retention: "24h",
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
