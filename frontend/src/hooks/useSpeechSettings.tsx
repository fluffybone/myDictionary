import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { canUseSpeechSynthesis, getEnglishSpeechVoices } from "../utils/speech";

const SPEECH_VOICE_STORAGE_KEY = "wordeater_speech_voice_uri";

type TSpeechSettingsContext = {
  englishVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  setSelectedVoiceURI: (voiceURI: string) => void;
};

const SpeechSettingsContext = createContext<TSpeechSettingsContext | null>(null);

type TProps = {
  children: ReactNode;
};

export const SpeechSettingsProvider: FC<TProps> = ({ children }) => {
  const [englishVoices, setEnglishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState(() =>
    localStorage.getItem(SPEECH_VOICE_STORAGE_KEY) ?? "",
  );

  useEffect(() => {
    if (!canUseSpeechSynthesis()) return;

    const syncVoices = () => {
      setEnglishVoices(getEnglishSpeechVoices());
    };

    syncVoices();
    speechSynthesis.addEventListener("voiceschanged", syncVoices);

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", syncVoices);
    };
  }, []);

  const setSelectedVoiceURI = (voiceURI: string) => {
    setSelectedVoiceURIState(voiceURI);

    if (voiceURI) {
      localStorage.setItem(SPEECH_VOICE_STORAGE_KEY, voiceURI);
    } else {
      localStorage.removeItem(SPEECH_VOICE_STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({ englishVoices, selectedVoiceURI, setSelectedVoiceURI }),
    [englishVoices, selectedVoiceURI],
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
