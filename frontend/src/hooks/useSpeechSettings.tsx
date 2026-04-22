import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  type TLanguage,
  type TLanguageCode,
} from "../constants/languages";
import {
  canUseSpeechSynthesis,
  getSpeechVoicesByLanguage,
} from "../utils/speech";

const SPEECH_VOICE_STORAGE_KEY = "wordeater_speech_voice_uri";
const ACTIVE_LANGUAGE_STORAGE_KEY = "wordeater_active_language";

type TSpeechSettingsContext = {
  activeLanguage: TLanguage;
  selectedVoiceURI: string;
  setActiveLanguageCode: (languageCode: TLanguageCode) => void;
  setSelectedVoiceURI: (voiceURI: string) => void;
  voices: SpeechSynthesisVoice[];
};

const SpeechSettingsContext = createContext<TSpeechSettingsContext | null>(null);

type TProps = {
  children: ReactNode;
};

export const SpeechSettingsProvider: FC<TProps> = ({ children }) => {
  const [activeLanguage, setActiveLanguage] = useState<TLanguage>(() =>
    getLanguageByCode(localStorage.getItem(ACTIVE_LANGUAGE_STORAGE_KEY)),
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceByLanguage, setVoiceByLanguage] = useState<
    Partial<Record<TLanguageCode, string>>
  >(
    () => {
      try {
        return JSON.parse(
          localStorage.getItem(SPEECH_VOICE_STORAGE_KEY) ?? "{}",
        );
      } catch {
        return {};
      }
    },
  );

  const selectedVoiceURI = voiceByLanguage[activeLanguage.code] ?? "";

  useEffect(() => {
    if (!canUseSpeechSynthesis()) return;

    const syncVoices = () => {
      setVoices(getSpeechVoicesByLanguage(activeLanguage.speechLang));
    };

    syncVoices();
    speechSynthesis.addEventListener("voiceschanged", syncVoices);

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", syncVoices);
    };
  }, [activeLanguage.speechLang]);

  const setActiveLanguageCode = (languageCode: TLanguageCode) => {
    const nextLanguage = getLanguageByCode(languageCode) ?? DEFAULT_LANGUAGE;

    setActiveLanguage(nextLanguage);
    localStorage.setItem(ACTIVE_LANGUAGE_STORAGE_KEY, nextLanguage.code);
  };

  const setSelectedVoiceURI = (voiceURI: string) => {
    setVoiceByLanguage((prev) => {
      const next = { ...prev };

      if (voiceURI) {
        next[activeLanguage.code] = voiceURI;
      } else {
        delete next[activeLanguage.code];
      }

      localStorage.setItem(SPEECH_VOICE_STORAGE_KEY, JSON.stringify(next));

      return next;
    });
  };

  const value = useMemo(
    () => ({
      activeLanguage,
      selectedVoiceURI,
      setActiveLanguageCode,
      setSelectedVoiceURI,
      voices,
    }),
    [activeLanguage, selectedVoiceURI, voices],
  );

  return (
    <SpeechSettingsContext.Provider value={value}>
      {children}
    </SpeechSettingsContext.Provider>
  );
};

export const useSpeechSettings = () => {
  const context = useContext(SpeechSettingsContext);

  if (!context) {
    throw new Error("useSpeechSettings must be used inside SpeechSettingsProvider");
  }

  return context;
};
