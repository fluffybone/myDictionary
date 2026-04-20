export const canUseSpeechSynthesis = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

const PRIMARY_VOICE_NAME = "Aaron";
const FALLBACK_VOICE_NAME = "Flo";

const isEnglishVoice = (voice: SpeechSynthesisVoice) =>
  voice.lang.toLowerCase().startsWith("en");

const isAaronVoice = (voice: SpeechSynthesisVoice) =>
  voice.name.toLowerCase().includes(PRIMARY_VOICE_NAME.toLowerCase());

const isFloVoice = (voice: SpeechSynthesisVoice) =>
  voice.name.toLowerCase().includes(FALLBACK_VOICE_NAME.toLowerCase());

const getEnglishVoice = () => {
  const voices = speechSynthesis.getVoices();

  return (
    voices.find((voice) => isAaronVoice(voice) && voice.lang === "en-US") ??
    voices.find((voice) => isAaronVoice(voice) && isEnglishVoice(voice)) ??
    voices.find(isAaronVoice) ??
    voices.find(
      (voice) =>
        isFloVoice(voice) && voice.lang === "en-US" && voice.localService,
    ) ??
    voices.find((voice) => isFloVoice(voice) && voice.lang === "en-US") ??
    voices.find((voice) => isFloVoice(voice) && isEnglishVoice(voice)) ??
    voices.find(isFloVoice) ??
    voices.find(isEnglishVoice) ??
    null
  );
};

export const getEnglishSpeechVoices = () => {
  if (!canUseSpeechSynthesis()) return [];

  return speechSynthesis.getVoices().filter(isEnglishVoice);
};

const getVoiceByUri = (voiceURI?: string) => {
  if (!voiceURI) return null;

  return (
    speechSynthesis
      .getVoices()
      .find((voice) => voice.voiceURI === voiceURI) ?? null
  );
};

export const speakEnglishWord = (word: string, voiceURI?: string) => {
  const text = word.trim();

  if (!text || !canUseSpeechSynthesis()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getVoiceByUri(voiceURI) ?? getEnglishVoice();

  utterance.lang = "en-US";
  utterance.voice = voice;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};
