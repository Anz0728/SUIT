export const voiceStyles = [
  { id: "bright", label: "밝게", pitch: 0.12, rate: 0.04 },
  { id: "soft", label: "부드럽게", pitch: -0.06, rate: -0.04 },
  { id: "calm", label: "차분하게", pitch: -0.1, rate: -0.08 },
  { id: "confident", label: "당당하게", pitch: -0.04, rate: 0.02 },
  { id: "friendly", label: "친근하게", pitch: 0.07, rate: 0 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Browser voices do not expose reliable gender or age metadata. These choices
// adjust pitch and rate; the selected device voice determines the actual timbre.
export function speechProfile(prefs) {
  const chosen = voiceStyles.filter((item) => (prefs.voiceStyles ?? [prefs.voiceStyle]).includes(item.id));
  const stylePitch = chosen.length ? chosen.reduce((sum, item) => sum + item.pitch, 0) / chosen.length : 0;
  const styleRate = chosen.length ? chosen.reduce((sum, item) => sum + item.rate, 0) / chosen.length : 0;
  const genderPitch = prefs.voiceGender === "feminine" ? 0.12
    : prefs.voiceGender === "masculine" ? -0.12 : 0;
  const agePitch = prefs.voiceAge === "young" ? 0.08
    : prefs.voiceAge === "older" ? -0.08 : 0;
  const ageRate = prefs.voiceAge === "older" ? -0.08 : 0;
  return {
    pitch: clamp(1 + genderPitch + agePitch + stylePitch, 0.5, 1.5),
    rate: clamp(prefs.speechRate + ageRate + styleRate, 0.5, 1.5),
  };
}
