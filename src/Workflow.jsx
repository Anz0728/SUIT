import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Mic,
  RotateCcw,
  Volume2,
  Square,
  Send,
  Plus,
  X,
  Check,
  Search,
  History,
  ShieldCheck,
  Hand,
  Settings,
  BookOpen,
  Columns2,
  Trash2,
  Pencil,
  Eye,
  CameraOff,
  SwitchCamera,
  AlertCircle,
  Users,
  ClipboardList,
  Database,
  Building2,
  GraduationCap,
  Landmark,
  HeartPulse,
} from "lucide-react";
import { useApp } from "./AppState";
import {
  scenarios,
  getPhrases,
  newId,
  retentionLabels,
  scenarioById,
} from "./scenarios";

export const situationIcons = {
  hospital: HeartPulse,
  school: GraduationCap,
  public: Landmark,
  office: Building2,
};
const formatTime = (value) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
const workflowGuides = {
  hospital: {
    purpose: "접수·예약·기초 문진",
    question: "예약 성함, 신분증, 불편한 부위를 차례로 확인해 주세요.",
    next: "접수 후 대기 장소를 안내하고, 전문 설명은 담당자 또는 통역 확인으로 넘겨요.",
  },
  public: {
    purpose: "서류 발급·민원 신청",
    question: "발급받을 서류, 신분증, 신청서 작성 여부를 확인해 주세요.",
    next: "담당 창구와 수수료, 수령 시점을 짧은 문장으로 남겨 주세요.",
  },
  school: {
    purpose: "상담·수업 지원",
    question: "상담 주제, 일정, 필요한 문자 지원 여부를 확인해 주세요.",
    next: "확정된 상담 시간과 준비할 내용을 대화 기록에 남겨요.",
  },
  office: {
    purpose: "복지 상담·지원 신청",
    question: "필요한 지원, 제출 서류, 회의 내용 공유 방식을 확인해 주세요.",
    next: "신청 절차와 다음 연락 방법을 글로 남겨 후속 안내 공백을 줄여요.",
  },
};
function ConversationSummary({ messages, scenario }) {
  const guide = workflowGuides[scenario.id] ?? workflowGuides.hospital;
  const lastUser = [...messages]
    .reverse()
    .find((m) => m.mode === "sign" || m.mode === "text");
  const lastStaff = [...messages].reverse().find((m) => m.mode === "voice");
  return (
    <section className="workflow-summary" aria-label="업무 응대 요약">
      <div className="summary-head">
        <span>직원 응대 요약</span>
        <strong>{scenario.title}</strong>
      </div>
      <div className="summary-grid">
        <div>
          <small>방문 목적</small>
          <strong>{lastUser?.text ?? guide.purpose}</strong>
        </div>
        <div>
          <small>최근 안내</small>
          <strong>{lastStaff?.text ?? "직원 안내를 입력하면 여기에 정리됩니다."}</strong>
        </div>
      </div>
      <ol className="next-checks">
        <li>
          <span>후속 질문</span>
          {guide.question}
        </li>
        <li>
          <span>다음 절차</span>
          {guide.next}
        </li>
        <li>
          <span>안전 기준</span>
          진단·처방·수급 자격 판단은 자동 처리하지 않고 담당자 확인으로 넘겨요.
        </li>
      </ol>
    </section>
  );
}

function Header({ title, label, back = "home", action }) {
  const app = useApp();
  return (
    <header className="sub-header">
      <button
        className="icon-button"
        onClick={() => app.setScreen(back)}
        aria-label="뒤로가기"
      >
        <ArrowLeft size={21} />
      </button>
      <div>
        <p className="eyebrow">{label ?? app.scenario.title}</p>
        <h1 tabIndex={-1}>{title}</h1>
      </div>
      {action}
    </header>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => previous?.isConnected && previous.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`guide-dialog ${wide ? "wide-dialog" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="guide-top">
        <h2>{title}</h2>
        <button
          className="icon-button"
          autoFocus
          onClick={onClose}
          aria-label="닫기"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function LanguageControl() {
  const { state, setPrefs } = useApp();
  return (
    <div className="language-control" role="group" aria-label="표시 언어">
      {[
        ["ko", "한국어"],
        ["both", "한국어 + English"],
        ["en", "English"],
      ].map(([value, label]) => (
        <button
          key={value}
          aria-pressed={state.prefs.language === value}
          className={state.prefs.language === value ? "active" : ""}
          onClick={() => setPrefs({ language: value })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function MessageText({ text, english }) {
  const { state } = useApp();
  const language = state.prefs.language;
  return (
    <div className="message-text">
      {(language !== "en" || !english) && <p>{text}</p>}
      {language !== "ko" &&
        (english ? (
          <p className="english-text" lang="en">
            {english}
          </p>
        ) : (
          <small className="translation-pending">
            영어 번역이 없는 문장이에요. 한국어 원문을 표시합니다.
          </small>
        ))}
    </div>
  );
}

function Playback({ text, english }) {
  const { speak, speaking, stopSpeech } = useApp();
  return (
    <div className="playback-actions">
      <button onClick={() => speak(text)}>
        <Volume2 size={15} />
        한국어 듣기
      </button>
      {english && (
        <button onClick={() => speak(english, "en")}>
          <Volume2 size={15} />
          English
        </button>
      )}
      {speaking && (
        <button onClick={stopSpeech}>
          <Square size={13} />
          재생 중지
        </button>
      )}
    </div>
  );
}

export function SituationScreen() {
  const app = useApp();
  return (
    <div className="screen situation-screen">
      <Header label="상황 선택" title="어디에서 대화하나요?" />
      <p className="screen-note">
        상황에 맞춰 추천 표현, 상대방의 예시 응답, 인식 안내가 함께 바뀝니다.
        이전 대화는 기록에서 이어갈 수 있어요.
      </p>
      <section className="situation-list" aria-label="상황 목록">
        {scenarios.map((s) => {
          const Icon = situationIcons[s.id];
          return (
            <button
              key={s.id}
              className={`situation-card ${s.accent} ${app.scenario.id === s.id ? "selected" : ""}`}
              aria-pressed={app.scenario.id === s.id}
              onClick={() => app.choose(s.id)}
            >
              <span className="situation-icon">
                <Icon size={26} />
              </span>
              <span className="situation-copy">
                <strong>{s.title}</strong>
                <small>{s.description}</small>
              </span>
              <span className="phrase-count">
                {getPhrases(s.id, app.state.overrides).length}개 표현
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
}

function useMedia(kind = "video") {
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const current = useRef(null);
  const generation = useRef(0);
  function stop() {
    generation.current++;
    current.current?.getTracks().forEach((t) => t.stop());
    current.current = null;
    setStream(null);
    setStatus("idle");
  }
  useEffect(
    () => () => {
      generation.current++;
      current.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  async function start(facing = "user") {
    stop();
    const token = ++generation.current;
    setError("");
    setStatus("loading");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const media = await navigator.mediaDevices.getUserMedia(
        kind === "video"
          ? { video: { facingMode: { ideal: facing } }, audio: false }
          : { audio: true, video: false },
      );
      if (token !== generation.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      current.current = media;
      setStream(media);
      setStatus("ready");
    } catch (e) {
      if (token !== generation.current) return;
      setStatus("error");
      setError(
        e.name === "NotAllowedError"
          ? "권한이 허용되지 않았어요. 브라우저의 사이트 설정에서 권한을 확인하거나 예시 모드로 계속할 수 있어요."
          : e.name === "NotFoundError"
            ? "사용할 수 있는 장치를 찾지 못했어요. 예시 모드로 계속할 수 있어요."
            : "장치를 열 수 없어요. HTTPS 또는 localhost와 장치 연결 상태를 확인해 주세요.",
      );
    }
  }
  return { stream, status, error, start, stop };
}

function CameraModule({ onRecognized }) {
  const app = useApp();
  const media = useMedia();
  const video = useRef(null);
  const [facing, setFacing] = useState("user");
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [automatic, setAutomatic] = useState(false);
  const [low, setLow] = useState(false);
  const timer = useRef(null);
  const candidate = app.phrases[index] ?? app.phrases[0];
  useEffect(() => {
    if (video.current) video.current.srcObject = media.stream;
  }, [media.stream]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function recognize() {
    if (!candidate || busy) return;
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      setAutomatic(false);
      onRecognized({
        ...candidate,
        sourceText: candidate.text,
        mode: "sign",
        confidence: low ? 64 : 92,
      });
    }, 800);
  }
  useEffect(() => {
    if (!automatic || busy || !candidate) return;
    const t = setTimeout(recognize, 3000);
    return () => clearTimeout(t);
  }, [automatic, busy, candidate, low]);
  function reset() {
    clearTimeout(timer.current);
    setAutomatic(false);
    setBusy(false);
    setIndex((i) => (i + 1) % Math.max(1, app.phrases.length));
  }
  async function flip() {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    if (media.stream) await media.start(next);
  }
  return (
    <div className="capture-module">
      <div className="feature-note">
        <Camera size={17} />
        <span>
          카메라는 미리보기 전용이에요. 수어 인식 결과는 선택한 예시 문장으로
          체험합니다.
        </span>
      </div>
      <section className="camera-view" aria-label="카메라 미리보기">
        {media.stream && (
          <video
            ref={video}
            autoPlay
            playsInline
            muted
            className={facing === "user" ? "mirrored" : ""}
          />
        )}
        <div className="scan-frame">
          <span className="corner top-left" />
          <span className="corner top-right" />
          <span className="corner bottom-left" />
          <span className="corner bottom-right" />
          {!media.stream && (
            <div className="person-guide">
              <span className="head-guide" />
              <span className="body-guide" />
              <span className="hand-guide left" />
              <span className="hand-guide right" />
            </div>
          )}
        </div>
        <span className="camera-mode-tag">
          {media.stream ? "카메라 미리보기" : "예시 모드"}
        </span>
        <div className="camera-status" role="status">
          <span className="live-dot" />
          {busy
            ? "예시 결과를 준비하고 있어요"
            : automatic
              ? "3초 후 예시를 자동으로 확인해요"
              : "얼굴과 양손, 상체가 화면에 보이도록 맞춰주세요"}
        </div>
      </section>
      <div className="inline-actions">
        <button
          disabled={media.status === "loading"}
          onClick={() => (media.stream ? media.stop() : media.start(facing))}
        >
          {media.stream ? <CameraOff size={17} /> : <Camera size={17} />}{" "}
          {media.status === "loading"
            ? "권한 확인 중…"
            : media.stream
              ? "카메라 끄기"
              : "카메라 켜기"}
        </button>
        <button disabled={media.status === "loading"} onClick={flip}>
          <SwitchCamera size={17} />
          {facing === "user" ? "후면으로 전환" : "전면으로 전환"}
        </button>
      </div>
      {media.error && (
        <p className="inline-error" role="alert">
          {media.error}
        </p>
      )}
      <p className="screen-note">{app.scenario.signHint}</p>
      <label className="field-label">
        체험할 수어 표현
        <select
          aria-label="체험할 수어 표현"
          value={candidate?.id ?? ""}
          disabled={busy}
          onChange={(e) =>
            setIndex(app.phrases.findIndex((p) => p.id === e.target.value))
          }
        >
          {app.phrases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.text}
            </option>
          ))}
        </select>
      </label>
      {!candidate && (
        <p className="empty-state">
          등록된 표현이 없어요. 관리자에서 표현을 추가하거나 직접 입력해 주세요.
        </p>
      )}
      <div className="demo-options">
        <label>
          <input
            type="checkbox"
            checked={automatic}
            disabled={busy || !candidate}
            onChange={(e) => setAutomatic(e.target.checked)}
          />
          자동 인식 체험
        </label>
        <label>
          <input
            type="checkbox"
            checked={low}
            disabled={busy}
            onChange={(e) => setLow(e.target.checked)}
          />
          확인 필요 결과 체험
        </label>
      </div>
      <div className="camera-actions">
        <button className="secondary-action" onClick={reset}>
          <RotateCcw size={18} />
          다시 인식
        </button>
        <button
          className="confirm-action"
          onClick={recognize}
          disabled={busy || !candidate}
        >
          {busy ? "결과 준비 중…" : "예시 인식하기"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export function CameraScreen() {
  const app = useApp();
  return (
    <div className="screen camera-screen workflow-camera">
      <Header title="손끝의 이야기를 전해요" />
      <CameraModule
        onRecognized={(p) => {
          app.setDraft(p);
          app.setScreen("result");
        }}
      />
      <button className="text-link" onClick={() => app.setScreen("chat")}>
        카메라 대신 직접 입력하기 <ArrowRight size={16} />
      </button>
    </div>
  );
}

function ReviewContent({ value, onDone, onBack }) {
  const app = useApp();
  const [text, setText] = useState(value.text);
  const [english, setEnglish] = useState(value.english ?? "");
  const [editing, setEditing] = useState(false);
  const [ack, setAck] = useState(false);
  const low =
    value.confidence !== null &&
    value.confidence !== undefined &&
    value.confidence < 80;
  return (
    <div className="review-content">
      <LanguageControl />
      <div className="result-meta">
        <span>
          {app.scenario.title} ·{" "}
          {value.mode === "sign"
            ? "수어 예시"
            : value.mode === "voice"
              ? "음성 예시"
              : "선택한 표현"}
        </span>
        {value.confidence != null && (
          <strong>예시 확신도 {value.confidence}%</strong>
        )}
      </div>
      {low && (
        <p className="inline-warning">
          <AlertCircle size={18} />
          확신도가 낮은 예시예요. 내용이 맞는지 확인하거나 수정해 주세요.
        </p>
      )}
      <section className="result-card">
        <p className="recognized-label">
          {editing ? "문장 수정" : "전달할 문장"}
        </p>
        {editing ? (
          <>
            <label className="field-label">
              한국어
              <textarea
                aria-label="한국어 문장 수정"
                maxLength={1000}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setEnglish(app.englishFor(e.target.value));
                  setAck(false);
                }}
              />
            </label>
            <label className="field-label">
              English · 선택
              <textarea
                aria-label="영어 문장 수정"
                maxLength={1500}
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
              />
            </label>
            <small className="screen-note">
              직접 바꾼 문장은 자동 번역되지 않아요. 영어도 함께 수정할 수
              있어요.
            </small>
          </>
        ) : (
          <MessageText text={text} english={english} />
        )}
        <Playback text={text} english={english} />
      </section>
      {low && (
        <label className="confirm-check">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
          />
          내용을 확인했어요
        </label>
      )}
      {low && (
        <div className="handoff-panel">
          <strong>전문 확인이 필요한 대화로 표시</strong>
          <p>
            낮은 확신도 결과는 바로 확정하지 않고 재입력, 직원 확인, 전문
            수어통역 연결 대상으로 분류합니다.
          </p>
          <div>
            <span>재입력 요청</span>
            <span>직원 확인</span>
            <span>통역 연결</span>
          </div>
        </div>
      )}
      <div className="review-actions">
        <button className="edit-button" onClick={() => setEditing(!editing)}>
          <Pencil size={17} />
          {editing ? "수정 내용 보기" : "수정하기"}
        </button>
        <button
          className="done-button"
          disabled={!text.trim() || (low && !ack)}
          onClick={() =>
            onDone({
              ...value,
              text: text.trim(),
              english: english.trim(),
              edited: text !== value.text,
            })
          }
        >
          <Check size={17} />
          대화에 추가
        </button>
      </div>
      <button className="text-link" onClick={onBack}>
        <RotateCcw size={16} />
        돌아가서 다시 확인하기
      </button>
    </div>
  );
}

export function ResultScreen() {
  const app = useApp();
  return (
    <div className="screen result-screen">
      <Header
        title="전달하기 전에 확인해요"
        back={
          app.draft?.mode === "voice"
            ? "voice"
            : app.draft?.mode === "text"
              ? "phrases"
              : "camera"
        }
      />
      {app.draft ? (
        <ReviewContent
          value={app.draft}
          onDone={app.commit}
          onBack={() =>
            app.setScreen(
              app.draft.mode === "voice"
                ? "voice"
                : app.draft.mode === "text"
                  ? "phrases"
                  : "camera",
            )
          }
        />
      ) : (
        <p className="empty-state">
          아직 확인할 문장이 없어요. 표현을 선택해 주세요.
        </p>
      )}
    </div>
  );
}

export function VoiceScreen() {
  const app = useApp();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const timer = useRef(null);
  const reply = app.scenario.replies[index];
  useEffect(() => () => clearTimeout(timer.current), []);
  const record = () => {
    if (busy) {
      clearTimeout(timer.current);
      setBusy(false);
      return;
    }
    setBusy(true);
    setReady(false);
    timer.current = setTimeout(() => {
      setBusy(false);
      setReady(true);
    }, 1000);
  };
  return (
    <div className="screen voice-screen">
      <Header title={`${app.scenario.partner}의 말을 글자로`} />
      <div className="feature-note">
        <Mic size={17} />
        <span>
          음성 인식 체험 화면이에요. 실제 음성을 녹음하거나 전송하지 않으며,
          선택한 예시를 표시합니다.
        </span>
      </div>
      <section
        className={`voice-panel ${busy ? "is-recording" : ""}`}
        aria-label="음성 인식 체험"
      >
        <button
          className="record-button"
          onClick={record}
          aria-label={busy ? "체험 중지" : "음성 인식 체험 시작"}
        >
          {busy ? <Square size={34} /> : <Mic size={40} />}
        </button>
        <div className="wave-bars" aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <p role="status">
          {busy
            ? "예시 음성을 글자로 바꾸는 중…"
            : ready
              ? "예시 문장을 확인해 주세요"
              : "버튼을 눌러 음성 인식을 체험해요"}
        </p>
      </section>
      <label className="field-label">
        상대방의 예시 응답
        <select
          aria-label="상대방의 예시 응답"
          value={index}
          disabled={busy}
          onChange={(e) => {
            setIndex(Number(e.target.value));
            setReady(false);
          }}
        >
          {app.scenario.replies.map((r, i) => (
            <option key={r.text} value={i}>
              {r.text}
            </option>
          ))}
        </select>
      </label>
      {ready && (
        <section className="transcript-card">
          <p className="recognized-label">예시 음성 → 텍스트</p>
          <MessageText {...reply} />
        </section>
      )}
      <div className="voice-actions">
        <button
          className="edit-button"
          onClick={() => {
            clearTimeout(timer.current);
            setBusy(false);
            setReady(false);
            setIndex((i) => (i + 1) % app.scenario.replies.length);
          }}
        >
          다른 응답 체험
        </button>
        <button
          className="done-button"
          disabled={!ready || busy}
          onClick={() => app.preview(reply, "voice")}
        >
          문장 확인 <ArrowRight size={17} />
        </button>
      </div>
      <button className="text-link" onClick={() => app.setScreen("chat")}>
        상대방의 말을 직접 입력하기 <ArrowRight size={16} />
      </button>
    </div>
  );
}

function ChatContent({ compact = false }) {
  const app = useApp();
  const [text, setText] = useState("");
  const [sender, setSender] = useState("text");
  const [editing, setEditing] = useState(null);
  const [enlarged, setEnlarged] = useState(null);
  const [editText, setEditText] = useState("");
  const [editEnglish, setEditEnglish] = useState("");
  const messages = app.active?.messages ?? [];
  const conversation = useRef(null);
  useEffect(() => {
    if (conversation.current)
      conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [messages.length]);
  function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    app.append([{ mode: sender, text, english: app.englishFor(text) }]);
    setText("");
  }
  function loadExample() {
    const first = app.phrases[0];
    if (!first) return;
    app.append([
      { ...first, mode: "sign", confidence: 92 },
      { ...app.scenario.replies[0], mode: "voice" },
      { ...(app.phrases[1] ?? first), mode: "sign", confidence: 94 },
    ]);
  }
  return (
    <div className={`chat-content ${compact ? "compact" : ""}`}>
      <LanguageControl />
      <div className="conversation-toolbar">
        <span>
          {app.active
            ? `${messages.length}개 메시지 · ${retentionLabels[app.active.retention]}`
            : "새로운 대화"}
        </span>
        <button onClick={app.newConversation}>
          <Plus size={15} />새 대화
        </button>
      </div>
      {!!messages.length && (
        <ConversationSummary messages={messages} scenario={app.scenario} />
      )}
      <section
        className="conversation"
        aria-label="대화 내용"
        ref={conversation}
      >
        {!messages.length ? (
          <div className="chat-empty">
            <Hand size={32} />
            <h2>첫 문장을 건네 보세요.</h2>
            <p>{app.scenario.intro}</p>
            <button
              className="edit-button"
              onClick={loadExample}
              disabled={!app.phrases.length}
            >
              상황별 예시 대화 불러오기
            </button>
            <small>직접 입력하거나 표현을 골라 시작할 수도 있어요.</small>
          </div>
        ) : (
          messages.map((m) => (
            <article
              key={m.id}
              className={`message ${m.mode === "voice" ? "voice-message" : "sign-message"}`}
            >
              <div className="message-label">
                {m.mode === "voice" ? (
                  <Mic size={14} />
                ) : m.mode === "sign" ? (
                  <Hand size={14} />
                ) : (
                  <Pencil size={14} />
                )}
                <span>
                  {m.mode === "voice"
                    ? app.scenario.partner
                    : m.mode === "sign"
                      ? "수어 예시"
                      : "직접 입력"}
                  {m.edited ? " · 수정됨" : ""}
                </span>
                <time>
                  {new Date(m.createdAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <MessageText {...m} />
              {m.confidence != null && (
                <span className="confidence-chip">
                  예시 확신도 {m.confidence}%
                </span>
              )}
              <div className="message-tools">
                <button
                  onClick={() => {
                    setEditing(m);
                    setEditText(m.text);
                    setEditEnglish(m.english);
                  }}
                >
                  <Pencil size={13} />
                  수정
                </button>
                <button onClick={() => setEnlarged(m)}>
                  <Eye size={13} />
                  크게 보기
                </button>
              </div>
              <Playback {...m} />
            </article>
          ))
        )}
      </section>
      <form onSubmit={send} className="conversation-form">
        <label className="sender-select">
          말하는 사람
          <select
            aria-label="말하는 사람"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
          >
            <option value="text">나</option>
            <option value="voice">{app.scenario.partner}</option>
          </select>
        </label>
        <div className="chat-composer">
          <button
            type="button"
            className="tool-button"
            aria-label="표현 추가"
            onClick={() => app.setScreen("phrases")}
          >
            <Plus size={20} />
          </button>
          <input
            aria-label="메시지 입력"
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.nativeEvent.isComposing || e.keyCode === 229)
              )
                e.preventDefault();
            }}
            className="composer-field"
            placeholder="메시지를 입력하세요"
          />
          <button
            className="tool-button send-tool"
            type="submit"
            disabled={!text.trim()}
            aria-label="메시지 보내기"
          >
            <Send size={19} />
          </button>
        </div>
        <div className="inline-actions composer-modes">
          <button type="button" onClick={() => app.setScreen("camera")}>
            <Camera size={16} />
            수어
          </button>
          <button type="button" onClick={() => app.setScreen("voice")}>
            <Mic size={16} />
            음성
          </button>
          {!compact && (
            <button type="button" onClick={() => app.setScreen("dual")}>
              <Columns2 size={16} />
              카메라와 함께 보기
            </button>
          )}
        </div>
      </form>
      {enlarged && (
        <Modal
          title="상대방에게 보여주기"
          onClose={() => setEnlarged(null)}
          wide
        >
          <div className="enlarged-text">
            <MessageText {...enlarged} />
          </div>
          <Playback {...enlarged} />
        </Modal>
      )}
      {editing && (
        <Modal title="대화 문장 수정" onClose={() => setEditing(null)}>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editText.trim()) return;
              app.editMessage(editing.id, editText, editEnglish);
              setEditing(null);
            }}
          >
            <label className="field-label">
              한국어
              <textarea
                aria-label="대화 한국어 수정"
                maxLength={1000}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  setEditEnglish(app.englishFor(e.target.value));
                }}
              />
            </label>
            <label className="field-label">
              English · 선택
              <textarea
                aria-label="대화 영어 수정"
                maxLength={1500}
                value={editEnglish}
                onChange={(e) => setEditEnglish(e.target.value)}
              />
            </label>
            <p className="screen-note">
              등록된 표현 외 문장은 영어를 직접 입력할 수 있어요.
            </p>
            <button className="done-button" disabled={!editText.trim()}>
              수정 저장
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function ChatScreen() {
  return (
    <div className="screen chat-screen">
      <Header title="우리의 대화" />
      <ChatContent />
    </div>
  );
}

export function DualScreen() {
  const [candidate, setCandidate] = useState(null);
  const app = useApp();
  return (
    <div className="screen dual-screen">
      <Header title="보고, 확인하고, 대화해요" back="chat" />
      <div className="dual-layout">
        <div className="dual-camera">
          <h2>
            <Camera size={19} />
            카메라
          </h2>
          <CameraModule onRecognized={setCandidate} />
        </div>
        <div className="dual-chat">
          <h2>
            <BookOpen size={19} />
            대화
          </h2>
          <ChatContent compact />
        </div>
      </div>
      {candidate && (
        <Modal title="번역 문장 확인" onClose={() => setCandidate(null)} wide>
          <ReviewContent
            value={candidate}
            onDone={(value) => {
              app.append([value]);
              setCandidate(null);
              app.notify("확인한 문장을 대화에 추가했어요.");
            }}
            onBack={() => setCandidate(null)}
          />
        </Modal>
      )}
    </div>
  );
}

export function PhraseScreen() {
  const app = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const categories = ["전체", ...new Set(app.phrases.map((p) => p.category))];
  const filtered = app.phrases.filter(
    (p) =>
      (category === "전체" || p.category === category) &&
      `${p.text} ${p.english} ${p.subtext}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="screen phrase-screen">
      <Header title={app.scenario.title} label="자주 쓰는 표현" />
      <p className="screen-note">
        {app.scenario.description} · {app.phrases.length}개
      </p>
      <label className="search-bar">
        <Search size={19} />
        <input
          aria-label="표현 검색"
          placeholder="한국어 또는 영어로 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <section className="phrase-tabs" aria-label="표현 카테고리">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? "active" : ""}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </section>
      <section className="phrase-list" aria-label="표현 목록">
        {filtered.length ? (
          filtered.map((p) => (
            <button
              className="phrase-card"
              key={p.id}
              onClick={() => app.preview(p, "text")}
            >
              <span className="phrase-category">{p.category}</span>
              <strong>{p.text}</strong>
              <small lang="en">{p.english}</small>
              <small>{p.subtext}</small>
              <span className="phrase-use">
                확인 후 대화에 추가 <ArrowRight size={14} />
              </span>
            </button>
          ))
        ) : (
          <p className="empty-state">
            일치하는 표현이 없어요. 다른 검색어나 카테고리를 선택해 주세요.
          </p>
        )}
      </section>
    </div>
  );
}

export function HistoryScreen() {
  const app = useApp();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(null);
  const sessions = app.state.sessions.filter(
    (s) =>
      (!s.expiresAt || s.expiresAt > Date.now()) &&
      s.messages.length &&
      (filter === "all" || s.scenarioId === filter) &&
      `${scenarioById(s.scenarioId).title} ${s.messages.map((m) => m.text).join(" ")}`.includes(
        query,
      ),
  );
  return (
    <div className="screen history-screen">
      <Header title="다시 이어가는 이야기" label="대화 기록" />
      <div className="privacy-strip">
        <ShieldCheck size={18} />
        <span>이 브라우저에만 보관해요. 기기 간 동기화는 제공하지 않아요.</span>
      </div>
      <label className="search-bar">
        <Search size={18} />
        <input
          aria-label="대화 기록 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="대화 내용을 검색하세요"
        />
      </label>
      <div className="phrase-tabs" aria-label="기록 상황 필터">
        {[{ id: "all", title: "전체" }, ...scenarios].map((s) => (
          <button
            key={s.id}
            className={filter === s.id ? "active" : ""}
            aria-pressed={filter === s.id}
            onClick={() => setFilter(s.id)}
          >
            {s.title}
          </button>
        ))}
      </div>
      <section className="history-list" aria-label="대화 기록 목록">
        {!sessions.length && (
          <div className="chat-empty">
            <History size={32} />
            <h2>아직 표시할 대화가 없어요.</h2>
            <p>대화를 시작하면 이곳에서 다시 이어갈 수 있어요.</p>
            <button className="done-button" onClick={app.newConversation}>
              새 대화 시작
            </button>
          </div>
        )}
        {sessions.map((s) => (
          <article className="history-entry" key={s.id}>
            <button className="history-card" onClick={() => app.openSession(s)}>
              <span className="history-date">{formatTime(s.createdAt)}</span>
              <strong>{scenarioById(s.scenarioId).title}</strong>
              <small>{s.messages.at(-1).text}</small>
              <span className="history-state">
                {s.messages.length}개 메시지
              </span>
            </button>
            <div className="history-entry-footer">
              <label>
                보관 방법
                <select
                  aria-label={`${scenarioById(s.scenarioId).title} 보관 방법`}
                  value={s.retention}
                  onChange={(e) => app.setRetention(s.id, e.target.value)}
                >
                  {Object.entries(retentionLabels).map(([v, t]) => (
                    <option key={v} value={v}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="danger-button"
                onClick={() => setDeleting(s)}
                aria-label={`${scenarioById(s.scenarioId).title} 대화 삭제`}
              >
                <Trash2 size={16} />
                삭제
              </button>
            </div>
            <small className="expiry-note">
              {s.retention === "none"
                ? "현재 방문 중에만 유지되며 새로고침하면 사라집니다."
                : s.expiresAt
                  ? `${formatTime(s.expiresAt)} 만료 · 앱을 열거나 사용하는 동안 만료 기록을 정리합니다.`
                  : "직접 삭제할 때까지 이 브라우저에 보관됩니다."}
            </small>
          </article>
        ))}
      </section>
      {deleting && (
        <Modal title="이 대화를 삭제할까요?" onClose={() => setDeleting(null)}>
          <p className="screen-note">
            {scenarioById(deleting.scenarioId).title}의{" "}
            {deleting.messages.length}개 메시지를 이 기기에서 삭제합니다.
          </p>
          <div className="review-actions">
            <button className="edit-button" onClick={() => setDeleting(null)}>
              취소
            </button>
            <button
              className="danger-button solid"
              onClick={() => {
                app.deleteSession(deleting.id);
                setDeleting(null);
              }}
            >
              대화 삭제
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PermissionControl({ kind }) {
  const media = useMedia(kind);
  const label = kind === "video" ? "카메라" : "마이크";
  return (
    <div className="permission-item">
      <div>
        <strong>{label} 권한</strong>
        <small>
          {media.stream
            ? "장치 연결을 확인했어요. 확인 종료를 누르면 사용을 멈춥니다."
            : "확인 버튼을 누르면 브라우저에서 권한을 요청합니다."}
        </small>
      </div>
      <button
        className="edit-button"
        disabled={media.status === "loading"}
        onClick={() => (media.stream ? media.stop() : media.start())}
      >
        {media.status === "loading"
          ? "확인 중…"
          : media.stream
            ? "확인 종료"
            : `${label} 확인`}
      </button>
      {media.error && (
        <p className="inline-error" role="alert">
          {media.error}
        </p>
      )}
    </div>
  );
}

export function SettingsScreen() {
  const app = useApp();
  return (
    <div className="screen settings-screen">
      <Header title="나에게 편한 대화 환경" label="설정" />
      <section className="settings-group">
        <h2>화면과 언어</h2>
        <label className="setting-field">
          <span>
            <strong>글자 크기</strong>
            <small>대화와 번역 결과의 글자 크기를 조정해요.</small>
          </span>
          <select
            aria-label="글자 크기"
            value={app.state.prefs.textSize}
            onChange={(e) => app.setPrefs({ textSize: e.target.value })}
          >
            <option value="normal">기본</option>
            <option value="large">크게</option>
            <option value="extra">아주 크게</option>
          </select>
        </label>
        <div className="type-preview">내 이야기를 편안하게 전해요.</div>
        <label className="setting-field">
          <span>
            <strong>표시 언어</strong>
            <small>영어는 등록된 예시 번역이 있을 때 표시됩니다.</small>
          </span>
          <select
            aria-label="설정 표시 언어"
            value={app.state.prefs.language}
            onChange={(e) => app.setPrefs({ language: e.target.value })}
          >
            <option value="both">한국어 + English</option>
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </label>
      </section>
      <section className="settings-group">
        <h2>음성 출력</h2>
        <div className="setting-field">
          <span>
            <strong>번역문 음성 재생</strong>
            <small>기기에서 지원하는 한국어·영어 음성을 사용해요.</small>
          </span>
          <button
            role="switch"
            aria-checked={app.state.prefs.speech}
            aria-label="음성 출력"
            className={`switch-control ${app.state.prefs.speech ? "on" : ""}`}
            onClick={() => app.setPrefs({ speech: !app.state.prefs.speech })}
          >
            <span />
          </button>
        </div>
        <Playback
          text="안녕하세요. SUIT입니다."
          english="Hello. Welcome to SUIT."
        />
      </section>
      <section className="settings-group">
        <h2>대화 보관</h2>
        <label className="setting-field">
          <span>
            <strong>새 대화의 기본 보관 방법</strong>
            <small>기존 대화는 기록 화면에서 개별 변경할 수 있어요.</small>
          </span>
          <select
            aria-label="기본 보관 방법"
            value={app.state.prefs.retention}
            onChange={(e) => app.setPrefs({ retention: e.target.value })}
          >
            {Object.entries(retentionLabels).map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <p className="screen-note">
          저장 안 함은 현재 방문 중에만 유지됩니다. 기간이 지난 기록은 앱을
          열거나 사용하는 동안 삭제되며, 브라우저가 닫힌 동안에는 삭제 작업을
          실행하지 못해요.
        </p>
      </section>
      <section className="settings-group">
        <h2>장치 권한 확인</h2>
        <p className="screen-note">
          장치를 직접 확인할 때만 켭니다. 영상·음성은 저장하거나 서버로 전송하지
          않아요.
        </p>
        <PermissionControl kind="video" />
        <PermissionControl kind="audio" />
      </section>
      <button className="admin-entry" onClick={() => app.setScreen("admin")}>
        <span className="setting-icon">
          <Building2 size={22} />
        </span>
        <span className="setting-copy">
          <strong>기관 관리자 체험</strong>
          <small>표현·직원 목록·보관 설정을 이 기기에서 관리</small>
        </span>
        <ArrowRight size={19} />
      </button>
    </div>
  );
}

export function AdminScreen() {
  const app = useApp();
  const [tab, setTab] = useState("phrases");
  const [scenarioId, setScenarioId] = useState(app.scenario.id);
  const [edit, setEdit] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("직원");
  const entries = getPhrases(scenarioId, app.state.overrides);
  const [error, setError] = useState("");
  const today = new Date().toDateString();
  const todaySessions = app.state.sessions.filter(
    (s) => new Date(s.createdAt).toDateString() === today,
  ).length;
  const stats = [
    ["오늘 응대", todaySessions + "건"],
    [
      "검수 표현",
      scenarios.reduce(
        (sum, s) => sum + getPhrases(s.id, app.state.overrides).length,
        0,
      ) + "개",
    ],
    ["반복 확인 감소", "데모 지표"],
  ];
  function save(e) {
    e.preventDefault();
    if (!edit.text.trim() || !edit.category.trim()) return;
    if (
      entries.some(
        (p) => p.id !== edit.id && p.text.trim() === edit.text.trim(),
      )
    )
      return setError("같은 문장이 이미 등록되어 있어요.");
    const item = {
      ...edit,
      text: edit.text.trim(),
      category: edit.category.trim(),
      english: edit.english.trim(),
      subtext: edit.subtext.trim(),
    };
    app.savePhrases(
      scenarioId,
      entries.some((p) => p.id === item.id)
        ? entries.map((p) => (p.id === item.id ? item : p))
        : [...entries, item],
    );
    setEdit(null);
    app.notify("표현을 저장했어요. 추천 표현과 체험 화면에도 반영됩니다.");
  }
  return (
    <div className="screen admin-screen">
      <Header
        title="기관 도입 관리자"
        label={app.scenario.organization}
        back="settings"
      />
      <p className="feature-note">
        <ShieldCheck size={18} />이 브라우저의 프론트 체험입니다. 실제 직원 계정
        발급·권한 인증·이용 통계 서버 저장은 수행하지 않습니다.
      </p>
      <section className="admin-summary-panel">
        <h2>실증에서 확인할 운영 지표</h2>
        <div>
          <span>안내 이해도</span>
          <span>업무 완료율</span>
          <span>반복 확인 횟수</span>
          <span>평균 응대 시간</span>
        </div>
        <p>
          지원서의 실증 계획처럼 번역 정확도만 보지 않고 농인의 이해도와
          직원의 응대 부담 감소를 함께 확인하는 관리자 화면입니다.
        </p>
      </section>
      <section className="admin-stats">
        {stats.map(([label, value]) => (
          <div className="admin-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      <div className="phrase-tabs" aria-label="관리 메뉴">
        {[
          ["phrases", "표현 세트", ClipboardList],
          ["staff", "직원 목록", Users],
          ["retention", "보관 정책", Database],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
      {tab === "phrases" && (
        <>
          <div className="admin-toolbar">
            <label className="field-label">
              관리할 상황
              <select
                aria-label="관리할 상황"
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value)}
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="done-button"
              onClick={() => {
                setError("");
                setEdit({
                  id: newId(),
                  category: "안내",
                  text: "",
                  english: "",
                  subtext: "",
                });
              }}
            >
              <Plus size={17} />
              표현 추가
            </button>
          </div>
          <div className="admin-expression-list">
            {entries.map((p) => (
              <article key={p.id}>
                <div>
                  <span>{p.category}</span>
                  <strong>{p.text}</strong>
                  <small lang="en">{p.english || "영어 번역 없음"}</small>
                </div>
                <button
                  className="icon-button"
                  aria-label={`${p.text} 수정`}
                  onClick={() => {
                    setError("");
                    setEdit({ ...p });
                  }}
                >
                  <Pencil size={17} />
                </button>
                <button
                  className="icon-button danger-button"
                  aria-label={`${p.text} 삭제`}
                  onClick={() =>
                    setDeleting({ kind: "phrase", id: p.id, name: p.text })
                  }
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
            {!entries.length && (
              <p className="empty-state">
                등록된 표현이 없어요. 새 표현을 추가해 주세요.
              </p>
            )}
          </div>
        </>
      )}
      {tab === "staff" && (
        <>
          <form
            className="staff-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!staffName.trim()) return;
              app.setStaff([
                ...app.state.staff,
                { id: newId(), name: staffName.trim(), role: staffRole },
              ]);
              setStaffName("");
              app.notify(
                "직원 목록에 추가했어요. 실제 계정은 생성하지 않습니다.",
              );
            }}
          >
            <label className="field-label">
              직원 이름
              <input
                aria-label="직원 이름"
                maxLength={40}
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
              />
            </label>
            <label className="field-label">
              역할
              <select
                aria-label="새 직원 역할"
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
              >
                <option>직원</option>
                <option>관리자</option>
              </select>
            </label>
            <button className="done-button" disabled={!staffName.trim()}>
              목록에 추가
            </button>
          </form>
          <div className="admin-expression-list">
            {app.state.staff.map((person) => (
              <article key={person.id}>
                <div>
                  <strong>{person.name}</strong>
                  <small>로컬 체험 목록</small>
                </div>
                <select
                  aria-label={`${person.name} 역할`}
                  value={person.role}
                  onChange={(e) =>
                    app.setStaff(
                      app.state.staff.map((p) =>
                        p.id === person.id ? { ...p, role: e.target.value } : p,
                      ),
                    )
                  }
                >
                  <option>직원</option>
                  <option>관리자</option>
                </select>
                <button
                  className="icon-button danger-button"
                  aria-label={`${person.name} 직원 삭제`}
                  onClick={() =>
                    setDeleting({
                      kind: "staff",
                      id: person.id,
                      name: person.name,
                    })
                  }
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
          {!app.state.staff.length && (
            <p className="empty-state">아직 추가한 직원이 없어요.</p>
          )}
        </>
      )}
      {tab === "retention" && (
        <section className="settings-group">
          <h2>새 대화의 기본 보관 정책</h2>
          <label className="field-label">
            보관 기간
            <select
              aria-label="기관 기본 보관 방법"
              value={app.state.prefs.retention}
              onChange={(e) => app.setPrefs({ retention: e.target.value })}
            >
              {Object.entries(retentionLabels).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <p className="screen-note">
            이 기기의 설정과 동일하게 적용됩니다. 기존 대화는 기록 화면에서 개별
            변경할 수 있어요. 만료 기록은 앱 실행 중 또는 다음 방문 시
            정리됩니다.
          </p>
          <button
            className="edit-button"
            onClick={() => app.setScreen("history")}
          >
            대화 기록 관리 <ArrowRight size={16} />
          </button>
        </section>
      )}
      {edit && (
        <Modal title="표현 편집" onClose={() => setEdit(null)}>
          <form className="stack-form" onSubmit={save}>
            {[
              ["category", "카테고리", 40],
              ["text", "한국어 표현", 200],
              ["english", "English · 선택", 300],
              ["subtext", "상황 설명 · 선택", 150],
            ].map(([key, label, max]) => (
              <label className="field-label" key={key}>
                {label}
                <input
                  aria-label={label}
                  required={key === "text" || key === "category"}
                  maxLength={max}
                  value={edit[key]}
                  onChange={(e) => {
                    setEdit({
                      ...edit,
                      [key]: e.target.value,
                      ...(key === "text" ? { english: "" } : {}),
                    });
                    setError("");
                  }}
                />
              </label>
            ))}
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="done-button"
              disabled={!edit.text.trim() || !edit.category.trim()}
            >
              표현 저장
            </button>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="목록에서 삭제할까요?" onClose={() => setDeleting(null)}>
          <p className="screen-note">{deleting.name}</p>
          <div className="review-actions">
            <button className="edit-button" onClick={() => setDeleting(null)}>
              취소
            </button>
            <button
              className="danger-button solid"
              onClick={() => {
                if (deleting.kind === "phrase")
                  app.savePhrases(
                    scenarioId,
                    entries.filter((p) => p.id !== deleting.id),
                  );
                else
                  app.setStaff(
                    app.state.staff.filter((p) => p.id !== deleting.id),
                  );
                setDeleting(null);
                app.notify("목록에서 삭제했어요.");
              }}
            >
              삭제
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
