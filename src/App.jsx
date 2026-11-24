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
  camera: "내 수어를 글자로",
  voice: "상대방의 말을 글자로",
  result: "문장 확인",
  chat: "함께 대화",
  phrases: "자주 쓰는 표현",
  history: "대화 기록",
  settings: "내 설정",
  admin: "운영 데모",
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
    <div className={`suit-app text-${app.state.prefs.textSize} ${app.state.prefs.highContrast ? "contrast-high" : ""}`}>
      <header className="app-header">
        <button className="app-brand" onClick={() => setScreen("home")} aria-label="SUIT 홈">
          <span className="brand-mark"><Hand size={20} /></span>
          <span><strong>SUIT</strong><small>{screenLabels[screen]}</small></span>
        </button>
        <div className="mode-switch" role="group" aria-label="대화 모드 전환">
          <button className={screen === "chat" ? "active" : ""} onClick={() => setScreen("chat")}>대화</button>
          <button className={screen === "camera" ? "active" : ""} onClick={() => setScreen("camera")}>카메라</button>
        </div>
        <button className="profile-button" onClick={() => setScreen("settings")} aria-label="내 설정 열기"><Settings size={18} /></button>
      </header>

      <main className={`app-content ${fullBleed ? "full-bleed" : ""}`}>
        {content}
      </main>

      <nav className="bottom-nav" aria-label="주 메뉴">
        {[
          ["home", "홈", Home],
          ["chat", "대화", MessageCircle],
          ["history", "기록", History],
          ["settings", "설정", Accessibility],
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
        <span className="status-chip"><Sparkles size={14} /> 서로를 잇는 대화</span>
        <h1>내 말은 전하고,<br />상대방의 말은 글자로.</h1>
        <p>일상에서 서로 다른 방식으로도 편하게 대화해요.</p>
      </section>

      <section className="start-section" aria-labelledby="start-title">
        <div className="section-heading"><div><span>지금 시작하기</span><h2 id="start-title">어떤 방식이 편한가요?</h2></div></div>
        <div className="start-actions">
          <button className="start-action sign-action" onClick={() => app.setScreen("camera")}><span className="start-icon"><Hand size={34} /></span><span><strong>수어로 말하기</strong><small>내 표현을 골라 소리로 전해요</small></span><ArrowRight size={24} /></button>
          <button className="start-action voice-action" onClick={() => app.setScreen("voice")}><span className="start-icon"><Mic size={34} /></span><span><strong>상대방 말 보기</strong><small>마이크로 받아쓴 말을 확인해요</small></span><ArrowRight size={24} /></button>
        </div>
      </section>

      <section className="together-card">
        <span className="together-icon"><MessageCircle size={22} /></span>
        <div><strong>함께 대화하기</strong><small>서로 번갈아 말하고 대화를 이어가요</small></div>
        <button onClick={() => app.setScreen("chat")} aria-label="함께 대화하기 열기"><ArrowRight size={20} /></button>
      </section>

      <section className="home-shortcuts" aria-label="대화 도구">
        <button onClick={() => app.setScreen("phrases")}><BookOpen size={19} /><span>자주 쓰는 표현</span><ChevronRight size={17} /></button>
        <button onClick={onGuide}><Hand size={22} /><span>그림으로 사용법 보기</span><ChevronRight size={17} /></button>
      </section>

      <section className="scenario-card">
        <span className="scenario-icon"><ScenarioIcon size={23} /></span>
        <div><small>지금 필요한 표현</small><strong>{app.scenario.title}</strong><p>대화 상황을 바꿔 표현을 찾아보세요.</p></div>
        <button onClick={() => app.setScreen("situations")} aria-label="대화 상황 바꾸기"><ChevronRight size={20} /></button>
      </section>

      <section className="tts-card">
        <span className="round-icon"><Volume2 size={20} /></span>
        <div><strong>번역문 소리로 듣기</strong><small>필요할 때 켜거나 끌 수 있어요.</small></div>
        <button className={`switch ${app.state.prefs.speech ? "on" : ""}`} aria-pressed={app.state.prefs.speech} aria-label="음성 출력" onClick={() => app.setPrefs({ speech: !app.state.prefs.speech })}><span /></button>
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
        <h2 id="guide-title">그림으로 보는 사용법</h2>
        <div className="visual-guide-steps">
          <div><Hand size={34} /><ArrowRight size={18} /><Camera size={34} /><ArrowRight size={18} /><Volume2 size={34} /><strong>수어 → 카메라 → 소리</strong><small>현재 카메라는 미리보기이며 선택한 예시 문장을 소리로 전합니다.</small></div>
          <div><Mic size={34} /><ArrowRight size={18} /><MessageCircle size={34} /><ArrowRight size={18} /><Hand size={34} /><strong>말 → 마이크 → 수어 화면</strong><small>마이크 받아쓰기는 사용 가능해요. 실제 수어 영상은 아직 없습니다.</small></div>
        </div>
        <p className="guide-video-status"><Hand size={18} /> 수어로 설명하는 안내 영상은 아직 준비되지 않았어요.</p>
        <button className="primary-button" onClick={onClose}>시작할게요 <Check size={18} /></button>
      </section>
    </div>
  );
}

export default App;
