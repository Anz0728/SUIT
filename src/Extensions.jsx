import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  Camera,
  Check,
  Copy,
  DoorOpen,
  FileText,
  Hand,
  Link,
  Megaphone,
  Mic,
  MonitorSmartphone,
  PackageSearch,
  Send,
  Share2,
  ShieldAlert,
  Square,
  Upload,
  UserRound,
  Vibrate,
  Video,
  Volume2,
} from "lucide-react";
import { useApp } from "./AppState";

const environmentKinds = [
  { id: "menu", label: "메뉴판", icon: FileText, hint: "메뉴와 가격, 주문에 필요한 내용을 정리해요." },
  { id: "notice", label: "안내문", icon: Megaphone, hint: "일정과 장소, 주의사항을 쉽게 설명해요." },
  { id: "kiosk", label: "키오스크", icon: MonitorSmartphone, hint: "화면에서 다음에 누를 곳을 순서대로 알려줘요." },
  { id: "manual", label: "제품 설명서", icon: PackageSearch, hint: "사용법과 주의사항만 간단히 추려요." },
];

const examples = {
  menu: "김치찌개 9,000원 · 비빔밥 8,000원 · 매운맛 조절 가능 · 주문은 카운터에서",
  notice: "11월 30일 오후 2시 정기 점검. 점검 중 엘리베이터를 이용할 수 없습니다.",
  kiosk: "1. 메뉴 선택 2. 옵션 선택 3. 결제 수단 선택 4. 영수증 출력",
  manual: "전원 버튼을 2초간 누르세요. 물에 닿지 않게 하고 충전 중에는 사용하지 마세요.",
};

function titleFor(kind) {
  return environmentKinds.find((item) => item.id === kind)?.label ?? "주변 정보";
}

function summarize(kind, text) {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?。]|다\.)\s+|\s*[·•]\s*/).filter(Boolean);
  const important = sentences.slice(0, 4);
  const steps = kind === "kiosk"
    ? clean.split(/\s*(?=\d+[.)]\s*)/).filter(Boolean).slice(0, 5)
    : important;
  const prefix = {
    menu: "메뉴에서 주문에 필요한 정보를 찾았어요.",
    notice: "안내문의 날짜·장소·주의사항을 확인해 주세요.",
    kiosk: "화면을 아래 순서대로 이용하세요.",
    manual: "제품 사용 전 핵심 사용법과 안전 내용을 확인하세요.",
  }[kind];
  return {
    summary: `${prefix} ${important.join(" · ")}`.trim(),
    steps: steps.length ? steps : [clean],
    gloss: important.join(" / ").replace(/[.,]/g, "").toUpperCase(),
  };
}

function FeatureHeader({ title, subtitle }) {
  const app = useApp();
  return (
    <header className="extension-header">
      <button onClick={() => app.setScreen("features")} aria-label="기능 목록으로"><ArrowLeft size={21} /></button>
      <div><strong>{title}</strong><small>{subtitle}</small></div>
    </header>
  );
}

export function FeatureHubScreen() {
  const app = useApp();
  const cards = [
    ["environment", Camera, "주변 정보 이해", "메뉴판·안내문·키오스크·설명서를 쉽게 확인해요.", "SUIT Lens"],
    ["sense", BellRing, "일상 속 소리 시각화", "중요한 소리를 화면과 진동으로 알려줘요.", "SUIT Sense"],
    ["connect", Link, "비대면 소통 지원", "앱이 없는 사람과도 링크로 대화해요.", "SUIT Connect"],
  ];
  return (
    <div className="screen extensions-hub">
      <section className="extension-intro">
        <span>SUIT 생활 지원</span>
        <h1>대화 밖의 정보도<br />놓치지 않도록.</h1>
        <p>카메라, 소리, 링크 대화를 필요할 때 골라 사용하세요.</p>
      </section>
      <div className="extension-card-list">
        {cards.map(([screen, Icon, title, copy, eyebrow], index) => (
          <button key={screen} onClick={() => app.setScreen(screen)}>
            <span className={`extension-number n-${index + 1}`}>0{index + 1}</span>
            <span className="extension-card-icon"><Icon size={27} /></span>
            <span><small>{eyebrow}</small><strong>{title}</strong><p>{copy}</p></span>
          </button>
        ))}
      </div>
      <p className="extension-safety"><ShieldAlert size={18} /> 인식 결과는 중요한 결정이나 안전 장비를 대신하지 않습니다.</p>
    </div>
  );
}

export function EnvironmentScreen() {
  const app = useApp();
  const [kind, setKind] = useState("menu");
  const [image, setImage] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) return app.notify("8MB 이하 사진을 선택해 주세요.");
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
    setResult(null);
  };
  const analyze = () => {
    const source = text.trim();
    if (!image && !source) return app.notify("사진을 선택하거나 글자를 입력해 주세요.");
    if (!source) return app.notify("사진에서 읽힌 글자를 확인해 입력해 주세요.");
    setBusy(true);
    window.setTimeout(() => {
      setResult(summarize(kind, source));
      setBusy(false);
    }, 550);
  };

  return (
    <div className="screen extension-screen">
      <FeatureHeader title="SUIT Lens" subtitle="주변 정보 이해" />
      <div className="kind-grid">
        {environmentKinds.map(({ id, label, icon: Icon }) => (
          <button key={id} className={kind === id ? "active" : ""} onClick={() => { setKind(id); setResult(null); }}>
            <Icon size={20} /><span>{label}</span>
          </button>
        ))}
      </div>
      <p className="feature-help">{environmentKinds.find((item) => item.id === kind)?.hint}</p>
      <section className="lens-capture">
        {image ? <img src={image} alt="분석할 촬영 이미지" /> : <div><Camera size={42} /><strong>{titleFor(kind)} 사진을 준비해 주세요</strong><small>개인정보는 가리고 촬영하는 것이 좋아요.</small></div>}
        <input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => loadFile(e.target.files?.[0])} />
        <button onClick={() => fileRef.current?.click()}><Upload size={18} /> {image ? "다른 사진 선택" : "촬영 또는 사진 선택"}</button>
      </section>
      <label className="extension-field">
        <span>사진에서 읽힌 글자</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="OCR로 읽힌 글자를 붙여 넣거나 직접 입력하세요." maxLength={3000} />
        <button type="button" onClick={() => setText(examples[kind])}>예시 글자 불러오기</button>
      </label>
      <button className="extension-primary" disabled={busy} onClick={analyze}>{busy ? "핵심 내용을 정리하는 중…" : "핵심 내용 안내 받기"}</button>
      {result && (
        <section className="lens-result" aria-live="polite">
          <span><Check size={17} /> {titleFor(kind)} 분석 완료</span>
          <h2>{result.summary}</h2>
          <ol>{result.steps.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}</ol>
          <div className="sign-guide"><Hand size={25} /><div><strong>한국수어 안내용 문장</strong><p>{result.gloss}</p><small>현재는 수어 어순 참고 문장입니다. 실제 수어 영상 생성 모델과 연결할 수 있어요.</small></div></div>
          <button onClick={() => app.speak(result.summary)}><Volume2 size={18} /> 글로 정리한 내용 듣기</button>
        </section>
      )}
    </div>
  );
}

const soundTypes = [
  { id: "door", label: "초인종·노크", icon: DoorOpen, color: "mint" },
  { id: "name", label: "내 이름 부름", icon: UserRound, color: "blue" },
  { id: "broadcast", label: "안내 방송", icon: Megaphone, color: "violet" },
  { id: "danger", label: "경보·자동차 경적", icon: AlertTriangle, color: "red" },
];

function classifyTranscript(text, name) {
  if (name && text.includes(name)) return "name";
  if (/경보|위험|대피|화재|빵빵|경적/.test(text)) return "danger";
  if (/안내|알려드립니다|방송|출발|도착/.test(text)) return "broadcast";
  if (/딩동|똑똑|택배|문 앞/.test(text)) return "door";
  return null;
}

export function SenseScreen() {
  const app = useApp();
  const [enabled, setEnabled] = useState(false);
  const [name, setName] = useState(localStorage.getItem("suit-sense-name") ?? "");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const SpeechRecognition = typeof window === "undefined" ? null : window.SpeechRecognition || window.webkitSpeechRecognition;

  const alertSound = (id, transcript = "") => {
    const sound = soundTypes.find((item) => item.id === id);
    setEvents((items) => [{ id: crypto.randomUUID(), type: id, label: sound.label, transcript, at: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) }, ...items].slice(0, 8));
    navigator.vibrate?.(id === "danger" ? [250, 120, 250, 120, 400] : [180, 90, 180]);
  };

  useEffect(() => {
    if (!enabled || !SpeechRecognition) return undefined;
    let stopped = false;
    const start = () => {
      if (stopped) return;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "ko-KR";
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1]?.[0]?.transcript?.trim() ?? "";
        const type = classifyTranscript(transcript, name.trim());
        if (type) alertSound(type, transcript);
      };
      recognition.onerror = (event) => event.error === "not-allowed" && setError("마이크 권한을 허용해 주세요.");
      recognition.onend = () => !stopped && window.setTimeout(start, 300);
      try { recognition.start(); } catch { setError("소리 감지를 시작하지 못했어요."); }
    };
    start();
    return () => { stopped = true; recognitionRef.current?.abort(); };
  }, [enabled, name]);

  const toggle = () => {
    if (!SpeechRecognition) { setError("이 브라우저는 연속 음성 인식을 지원하지 않아요. 아래 체험 버튼을 이용해 주세요."); return; }
    setError("");
    setEnabled((value) => !value);
  };

  return (
    <div className="screen extension-screen sense-screen">
      <FeatureHeader title="SUIT Sense" subtitle="일상 속 소리 시각화" />
      <section className={`sense-status ${enabled ? "listening" : ""}`}>
        <span className="sense-pulse"><Mic size={32} /></span>
        <div><small>{enabled ? "주변 소리를 듣고 있어요" : "소리 감지가 꺼져 있어요"}</small><strong>{enabled ? "중요한 소리를 화면과 진동으로 알려드릴게요." : "필요할 때만 감지를 켜세요."}</strong></div>
        <button onClick={toggle}>{enabled ? <><Square size={17} /> 감지 중지</> : <><Mic size={17} /> 감지 시작</>}</button>
      </section>
      <label className="extension-field compact"><span>불릴 이름 (기기 안에만 저장)</span><input value={name} onChange={(e) => { setName(e.target.value); localStorage.setItem("suit-sense-name", e.target.value); }} placeholder="예: 수진" maxLength={30} /></label>
      {error && <p className="extension-error">{error}</p>}
      <section>
        <div className="extension-section-title"><div><small>감지 항목</small><h2>알림 체험</h2></div><span><Vibrate size={16} /> 진동 포함</span></div>
        <div className="sound-grid">
          {soundTypes.map(({ id, label, icon: Icon, color }) => <button key={id} className={color} onClick={() => alertSound(id, `${label} 체험 알림`)}><Icon size={24} /><strong>{label}</strong><small>눌러서 체험</small></button>)}
        </div>
      </section>
      <section className="event-log">
        <h2>최근 감지</h2>
        {events.length === 0 ? <p>아직 감지된 소리가 없어요.</p> : events.map((event) => <article key={event.id}><BellRing size={18} /><div><strong>{event.label}</strong><small>{event.transcript}</small></div><time>{event.at}</time></article>)}
      </section>
      <p className="danger-notice"><ShieldAlert size={19} /><span><strong>안전 보조 기능입니다.</strong> 모든 소리를 정확히 인식하지 못할 수 있습니다. 화재경보기, 도로 확인 등 기존 안전 수단을 함께 사용하세요.</span></p>
    </div>
  );
}

function kslGuide(text) {
  return text.trim().replace(/[,.!?]/g, "").split(/\s+/).filter(Boolean).slice(0, 12);
}

export function ConnectScreen() {
  const app = useApp();
  const initialRoom = new URLSearchParams(window.location.search).get("room") ?? "";
  const [room, setRoom] = useState(initialRoom);
  const [joined, setJoined] = useState(Boolean(initialRoom));
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);

  const link = room ? `${window.location.origin}${window.location.pathname}?room=${room}` : "";
  const createRoom = () => {
    const id = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
    setRoom(id); setJoined(true);
    window.history.replaceState({}, "", `?room=${id}`);
  };
  const share = async () => {
    if (navigator.share) await navigator.share({ title: "SUIT Connect 대화방", text: "앱 설치 없이 대화에 참여해 주세요.", url: link });
    else { await navigator.clipboard.writeText(link); app.notify("대화방 링크를 복사했어요."); }
  };
  const sendText = (mode = "voice") => {
    const text = input.trim();
    if (!text) return;
    setMessages((items) => [...items, { id: crypto.randomUUID(), from: mode === "sign" ? "me" : "guest", mode, text, tokens: kslGuide(text) }]);
    setInput("");
  };
  const record = async () => {
    if (recording) { recorderRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
      recorder.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunksRef.current, { type: recorder.mimeType }));
        setVideoUrl(url); stream.getTracks().forEach((track) => track.stop()); setRecording(false);
      };
      recorder.start(); setRecording(true);
    } catch { app.notify("카메라와 마이크 권한을 확인해 주세요."); }
  };
  useEffect(() => () => { recorderRef.current?.stream?.getTracks().forEach((track) => track.stop()); if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);

  if (!joined) return (
    <div className="screen extension-screen connect-screen">
      <FeatureHeader title="SUIT Connect" subtitle="비대면 소통 지원" />
      <section className="connect-hero"><span><Link size={34} /></span><h1>설치 없이 링크 하나로<br />서로의 말을 이어 주세요.</h1><p>수어 영상 메시지와 음성·문자를 한 대화방에서 주고받는 체험 기능입니다.</p></section>
      <button className="extension-primary" onClick={createRoom}><Video size={19} /> 새 통역 대화방 만들기</button>
      <label className="extension-field compact"><span>받은 방 코드로 참여</span><div className="join-row"><input value={room} onChange={(e) => setRoom(e.target.value.toUpperCase())} placeholder="8자리 코드" maxLength={12} /><button onClick={() => room.trim() && setJoined(true)}>참여</button></div></label>
      <p className="extension-safety"><ShieldAlert size={18} /> 민감한 대화에는 링크를 공개 게시하지 마세요.</p>
    </div>
  );

  return (
    <div className="screen extension-screen connect-screen">
      <FeatureHeader title="SUIT Connect" subtitle={`대화방 ${room}`} />
      <section className="room-share"><div><small>상대방은 앱 설치가 필요 없어요</small><strong>{link}</strong></div><button onClick={share}><Share2 size={18} /> 공유</button><button onClick={async () => { await navigator.clipboard.writeText(link); app.notify("링크를 복사했어요."); }} aria-label="링크 복사"><Copy size={18} /></button></section>
      <section className="connect-messages">
        {messages.length === 0 && <div className="connect-empty"><Hand size={32} /><strong>대화를 시작해 보세요</strong><p>수어 영상을 촬영하거나 상대방 음성의 받아쓰기 문장을 입력할 수 있어요.</p></div>}
        {messages.map((message) => <article key={message.id} className={message.from === "me" ? "mine" : "theirs"}><small>{message.mode === "sign" ? "수어 영상 → 음성 메시지" : "음성 메시지 → 수어 안내"}</small><p>{message.text}</p>{message.mode === "voice" && <div className="ksl-tokens">{message.tokens.map((token, index) => <span key={`${token}-${index}`}>{token}</span>)}</div>}<button onClick={() => app.speak(message.text)}><Volume2 size={15} /> 듣기</button></article>)}
      </section>
      <section className="video-message-box">
        <video ref={videoRef} src={videoUrl} muted={recording} controls={Boolean(videoUrl)} playsInline />
        <button className={recording ? "recording" : ""} onClick={record}>{recording ? <><Square size={17} /> 촬영 완료</> : <><Video size={18} /> 수어 영상 촬영</>}</button>
        {videoUrl && <button onClick={() => { if (!input.trim()) return app.notify("영상의 뜻을 문장으로 입력해 주세요."); sendText("sign"); }}><Send size={17} /> 음성 메시지로 보내기</button>}
      </section>
      <div className="connect-composer"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendText("voice")} placeholder="음성 받아쓰기 또는 영상의 뜻 입력" maxLength={1000} /><button onClick={() => sendText("voice")} aria-label="메시지 보내기"><Send size={20} /></button></div>
      <p className="prototype-note">현재 대화방은 이 브라우저에서 체험하는 MVP입니다. 백엔드 Connect API와 연결하면 다른 기기와 실시간으로 동기화할 수 있습니다.</p>
    </div>
  );
}
