import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  STORAGE_KEY,
  loadState,
  serializableState,
  scenarioById,
  getPhrases,
  getEnglish,
  newId,
  applyRetention,
  pruneSessions,
} from "./scenarios";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      return loadState(localStorage.getItem(STORAGE_KEY));
    } catch {
      return loadState(null);
    }
  });
  const [screen, setScreen] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const speechToken = useRef(0);
  const scenario = scenarioById(state.situationId);
  const phrases = getPhrases(scenario.id, state.overrides);
  const active = state.sessions.find(
    (s) =>
      s.id === activeId &&
      s.scenarioId === scenario.id &&
      (!s.expiresAt || s.expiresAt > Date.now()),
  );
  const notify = (message) => setToast(message);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(serializableState(state)),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);
  useEffect(() => {
    const prune = () =>
      setState((s) => {
        const sessions = pruneSessions(s.sessions);
        return sessions.length === s.sessions.length ? s : { ...s, sessions };
      });
    const timer = setInterval(prune, 15000);
    window.addEventListener("focus", prune);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", prune);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  const stopSpeech = () => {
    speechToken.current++;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };
  useEffect(() => {
    stopSpeech();
  }, [screen, state.prefs.speech]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function speak(text, language = "ko") {
    if (!state.prefs.speech) return notify("설정에서 음성 출력을 켜 주세요.");
    if (!text?.trim()) return notify("재생할 번역문이 없어요.");
    if (!("speechSynthesis" in window))
      return notify("이 브라우저는 음성 재생을 지원하지 않아요.");
    stopSpeech();
    const token = speechToken.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "en" ? "en-US" : "ko-KR";
    utterance.rate = 0.9;
    utterance.onstart = () =>
      token === speechToken.current && setSpeaking(true);
    utterance.onend = () => token === speechToken.current && setSpeaking(false);
    utterance.onerror = (e) => {
      if (token !== speechToken.current) return;
      setSpeaking(false);
      if (e.error !== "interrupted" && e.error !== "canceled")
        notify("음성을 재생하지 못했어요. 기기의 음성 지원을 확인해 주세요.");
    };
    window.speechSynthesis.speak(utterance);
  }

  const choose = (id) => {
    stopSpeech();
    setState((s) => ({ ...s, situationId: id }));
    setActiveId(null);
    setDraft(null);
    setScreen("home");
  };
  const preview = (phrase, mode = "sign", confidence = null) => {
    setDraft({ ...phrase, mode, confidence, sourceText: phrase.text });
    setScreen("result");
  };
  function append(items) {
    const now = Date.now();
    const sessionId = active?.id ?? newId();
    const messages = items
      .map((item) => ({
        ...item,
        text: item.text.trim(),
        english: item.english?.trim() ?? "",
        id: newId(),
        createdAt: now,
      }))
      .filter((m) => m.text);
    if (!messages.length) return;
    setState((s) => {
      let sessions = pruneSessions(s.sessions, now);
      const previous = sessions.find((c) => c.id === sessionId);
      const next = previous
        ? {
            ...previous,
            updatedAt: now,
            messages: [...previous.messages, ...messages],
          }
        : applyRetention(
            {
              id: sessionId,
              scenarioId: scenario.id,
              createdAt: now,
              updatedAt: now,
              messages,
            },
            s.prefs.retention,
            now,
          );
      return {
        ...s,
        sessions: [next, ...sessions.filter((c) => c.id !== sessionId)],
      };
    });
    setActiveId(sessionId);
  }
  const commit = (item) => {
    append([item]);
    setDraft(null);
    setScreen("chat");
    notify("확인한 문장을 대화에 추가했어요.");
  };
  const editMessage = (id, text, english) => {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === id
                  ? {
                      ...m,
                      text: text.trim(),
                      english: english.trim(),
                      edited: true,
                    }
                  : m,
              ),
            }
          : c,
      ),
    }));
    notify("문장을 수정했어요.");
  };
  const openSession = (session) => {
    if (session.expiresAt && session.expiresAt <= Date.now())
      return notify("보관 기간이 끝난 대화예요.");
    setState((s) => ({ ...s, situationId: session.scenarioId }));
    setActiveId(session.id);
    setScreen("chat");
  };
  const newConversation = () => {
    setActiveId(null);
    setDraft(null);
    setScreen("chat");
  };
  const deleteSession = (id) => {
    setState((s) => ({
      ...s,
      sessions: s.sessions.filter((c) => c.id !== id),
    }));
    if (activeId === id) setActiveId(null);
    notify("이 기기에서 대화를 삭제했어요.");
  };
  const setPrefs = (patch) =>
    setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
  const setRetention = (id, retention) => {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((c) =>
        c.id === id ? applyRetention(c, retention) : c,
      ),
    }));
    notify("이 대화의 보관 방법을 바꿨어요.");
  };
  const savePhrases = (id, entries) =>
    setState((s) => ({ ...s, overrides: { ...s.overrides, [id]: entries } }));
  const setStaff = (staff) => setState((s) => ({ ...s, staff }));

  return (
    <AppContext.Provider
      value={{
        state,
        scenario,
        phrases,
        active,
        screen,
        setScreen,
        choose,
        draft,
        setDraft,
        preview,
        commit,
        append,
        editMessage,
        newConversation,
        openSession,
        deleteSession,
        setPrefs,
        setRetention,
        savePhrases,
        setStaff,
        notify,
        speak,
        stopSpeech,
        speaking,
        englishFor: (text) => getEnglish(text, scenario.id, state.overrides),
      }}
    >
      {children}
      {storageError && (
        <div className="storage-error" role="alert">
          기기 저장 공간을 사용할 수 없어 현재 화면에서만 변경 사항이
          유지됩니다.
        </div>
      )}
      {toast && (
        <div className="app-toast" role="status">
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}
