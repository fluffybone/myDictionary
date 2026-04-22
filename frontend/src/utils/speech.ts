export const canUseSpeechSynthesis = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

const PRIMARY_VOICE_NAME = "Aaron";
const FALLBACK_VOICE_NAME = "Flo";

const isEnglishVoice = (voice: SpeechSynthesisVoice) =>
  voice.lang.toLowerCase().startsWith("en");

const isVoiceForLanguage = (voice: SpeechSynthesisVoice, speechLang: string) =>
  voice.lang.toLowerCase().startsWith(speechLang.slice(0, 2).toLowerCase());

const isAaronVoice = (voice: SpeechSynthesisVoice) =>
  voice.name.toLowerCase().includes(PRIMARY_VOICE_NAME.toLowerCase());

const isFloVoice = (voice: SpeechSynthesisVoice) =>
  voice.name.toLowerCase().includes(FALLBACK_VOICE_NAME.toLowerCase());

const getPreferredVoice = (speechLang: string) => {
  const voices = speechSynthesis.getVoices();
  const languageVoices = voices.filter((voice) =>
    isVoiceForLanguage(voice, speechLang),
  );

  if (!speechLang.toLowerCase().startsWith("en")) {
    return (
      languageVoices.find(
        (voice) => voice.lang === speechLang && voice.localService,
      ) ??
      languageVoices.find((voice) => voice.lang === speechLang) ??
      languageVoices.find((voice) => voice.localService) ??
      languageVoices[0] ??
      null
    );
  }

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

export const getSpeechVoicesByLanguage = (speechLang: string) => {
  if (!canUseSpeechSynthesis()) return [];

  return speechSynthesis
    .getVoices()
    .filter((voice) => isVoiceForLanguage(voice, speechLang));
};

const getVoiceByUri = (voiceURI?: string) => {
  if (!voiceURI) return null;

  return (
    speechSynthesis
      .getVoices()
      .find((voice) => voice.voiceURI === voiceURI) ?? null
  );
};

export const speakWord = (
  word: string,
  speechLang: string,
  voiceURI?: string,
) => {
  const text = word.trim();

  if (!text || !canUseSpeechSynthesis()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getVoiceByUri(voiceURI) ?? getPreferredVoice(speechLang);

  utterance.lang = speechLang;
  utterance.voice = voice;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};
