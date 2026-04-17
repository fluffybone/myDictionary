import { DisplayWords } from "../../features/DisplayWords";
import { useGetWordsQuery } from "../../store/words/api";

export const LearningWords = () => {
  const { data: words } = useGetWordsQuery({ isLearning: true });
  return <>{words && <DisplayWords words={words} />}</>;
};
