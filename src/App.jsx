import React, { useEffect, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Hand,
  HeartPulse,
  History,
  Home,
  Languages,
  MessageCircle,
  Mic,
  Settings,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { AppProvider, useApp } from "./AppState";
import {
  AdminScreen,
  CameraScreen,
  ChatScreen,
  DualScreen,
  HistoryScreen,
  PhraseScreen,
  ResultScreen,
  SettingsScreen,
  SituationScreen,
  VoiceScreen,
  situationIcons,
} from "./Workflow";

const screenLabels = {
  home: "홈",
  situations: "상황 선택",
  camera: "카메라 수어 인식",
  voice: "음성 인식",
  result: "번역 확인",
  chat: "양방향 실시간 대화",
  phrases: "자주 쓰는 표현",
  history: "통역 기록",
  settings: "접근성 및 인식 설정",
  admin: "기관 관리",
  dual: "카메라와 대화",
};

function App() {
  return (
    <AppProvider>
      <SuitApp />
    </AppProvider>
  );
}

function SuitApp() {
  const app = useApp();
  const { screen, setScreen } = app;
  const [guideOpen, setGuideOpen] = useState(false);
  const fullBleed = screen === "camera" || screen === "dual";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [screen]);

  const content = {
    home: <HomeScreen onGuide={() => setGuideOpen(true)} />,
    situations: <SituationScreen />,
    camera: <CameraScreen />,
    voice: <VoiceScreen />,
    result: <ResultScreen />,
    chat: <ChatScreen />,
    phrases: <PhraseScreen />,
    history: <HistoryScreen />,
    settings: <SettingsScreen />,
    admin: <AdminScreen />,
    dual: <DualScreen />,
  }[screen];

  return (
    <div className={`suit-app text-${app.state.prefs.textSize}`}>
      <header className="app-header">
        <button className="app-brand" onClick={() => setScreen("home")} aria-label="SUIT 홈">
          <span className="brand-mark"><Hand size={20} /></span>
          <span><strong>SUIT</strong><small>{screenLabels[screen]}</small></span>
        </button>
        <div className="mode-switch" role="group" aria-label="대화 모드 전환">
          <button className={screen === "chat" ? "active" : ""} onClick={() => setScreen("chat")}>대화</button>
          <button className={screen === "camera" ? "active" : ""} onClick={() => setScreen("camera")}>카메라</button>
        </div>
        <button className="profile-button" aria-label="내 프로필">M</button>
      </header>

      <main className={`app-content ${fullBleed ? "full-bleed" : ""}`}>
        {content}
      </main>

      <nav className="bottom-nav" aria-label="주 메뉴">
        {[
          ["home", "홈", Home],
          ["chat", "대화", MessageCircle],
          ["history", "기록", History],
          ["settings", "접근성", Accessibility],
        ].map(([id, label, Icon]) => (
          <button key={id} className={screen === id ? "active" : ""} aria-current={screen === id ? "page" : undefined} onClick={() => setScreen(id)}>
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {guideOpen && <GuideDialog onClose={() => setGuideOpen(false)} />}
    </div>
  );
}

function HomeScreen({ onGuide }) {
  const app = useApp();
  const ScenarioIcon = situationIcons[app.scenario.id] ?? HeartPulse;
  return (
    <div className="screen dashboard-screen">
      <section className="welcome-copy">
        <span className="status-chip"><Sparkles size={14} /> 연결 준비 완료</span>
        <h1>안녕하세요! 오늘은<br />어떤 대화를 도와드릴까요?</h1>
        <p>수어·음성·문자를 한 화면에서 이어서 대화해요.</p>
      </section>

      <section className="visual-card" aria-label="SUIT 실시간 소통 소개">
        <div className="visual-overlay">
          <span className="floating-label sign"><Hand size={15} /> 수어를 문장으로</span>
          <span className="floating-label voice"><Mic size={15} /> 음성을 자막으로</span>
          <div className="visual-caption">
            <strong>말과 손짓 사이,<br />소통은 끊기지 않도록.</strong>
            <button onClick={onGuide}>이용 방법 <ChevronRight size={16} /></button>
          </div>
        </div>
      </section>

      <section className="tts-card">
        <span className="round-icon"><Volume2 size={20} /></span>
        <div><strong>번역 내용을 소리로 들려드려요</strong><small>필요할 때 언제든 설정에서 바꿀 수 있어요.</small></div>
        <button className={`switch ${app.state.prefs.speech ? "on" : ""}`} aria-pressed={app.state.prefs.speech} aria-label="음성 출력" onClick={() => app.setPrefs({ speech: !app.state.prefs.speech })}><span /></button>
      </section>

      <section className="quick-grid" aria-label="빠른 시작">
        <button onClick={() => app.setScreen("camera")}><span><Camera size={24} /></span><strong>수어로 말하기</strong><small>카메라 인식</small></button>
        <button onClick={() => app.setScreen("voice")}><span><Mic size={24} /></span><strong>음성으로 말하기</strong><small>실시간 자막</small></button>
        <button onClick={() => app.setScreen("chat")}><span><MessageCircle size={24} /></span><strong>함께 대화하기</strong><small>양방향 대화</small></button>
        <button onClick={() => app.setScreen("phrases")}><span><BookOpen size={24} /></span><strong>자주 쓰는 표현</strong><small>빠른 문장</small></button>
      </section>

      <section className="scenario-card">
        <span className="scenario-icon"><ScenarioIcon size={23} /></span>
        <div><small>현재 대화 상황</small><strong>{app.scenario.title}</strong><p>{app.scenario.intro}</p></div>
        <button onClick={() => app.setScreen("situations")} aria-label="대화 상황 바꾸기"><ChevronRight size={20} /></button>
      </section>

      <section className="privacy-note">
        <ShieldCheck size={19} />
        <p><strong>안심하고 대화하세요.</strong> 인식 결과가 불확실하면 자동 전달하지 않고 다시 확인합니다.</p>
      </section>
    </div>
  );
}

function GuideDialog({ onClose }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="guide-card" role="dialog" aria-modal="true" aria-labelledby="guide-title">
        <div className="guide-heading"><span><Languages size={22} /></span><button onClick={onClose} aria-label="닫기"><X size={20} /></button></div>
        <h2 id="guide-title">대화를 시작하는 세 가지 방법</h2>
        {[
          [Camera, "수어를 카메라로 보여주세요", "인식한 문장을 확인한 뒤 상대방에게 전달합니다."],
          [Mic, "상대방의 음성을 들려주세요", "음성을 글자로 바꿔 농인 사용자가 읽을 수 있습니다."],
          [MessageCircle, "대화 화면에서 번갈아 말해요", "확인한 문장과 다음 안내를 한 흐름으로 정리합니다."],
        ].map(([Icon, title, body], index) => <div className="guide-row" key={title}><span>{index + 1}</span><Icon size={21} /><div><strong>{title}</strong><p>{body}</p></div></div>)}
        <button className="primary-button" onClick={onClose}>시작할게요 <Check size={18} /></button>
      </section>
    </div>
  );
}

export default App;
