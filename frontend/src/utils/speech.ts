export const canUseSpeechSynthesis = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export const speakEnglishWord = (word: string) => {
  const text = word.trim();

  if (!text || !canUseSpeechSynthesis()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};
