import { DisplayWords } from "../../features/DisplayWords";
import { useSpeechSettings } from "../../hooks/useSpeechSettings";
import { useGetWordsQuery } from "../../store/words/api";

export const LearningWords = () => {
  const { activeLanguage } = useSpeechSettings();
  const { data: words } = useGetWordsQuery({
    isLearning: true,
    language: activeLanguage.code,
  });

  return (
    <>
      {words && (
        <DisplayWords words={words.items} isLearning totalWords={words.total} />
      )}
    </>
  );
};
