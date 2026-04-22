import { useEffect, useState, type FC, type FormEvent } from "react";
import classes from "./index.module.css";
import {
  useAddWordMutation,
  useUpdateWordMutation,
  wordsApi,
  type TWordResponse,
} from "../../store/words/api";
import { getErrorText } from "../../store/utils/getErrorText";
import { ListWords } from "./components/ListWords";
import { useAppDispatch } from "../../store/utils/useAppDispatch";
import { SoundOutlined } from "@ant-design/icons";
import { canUseSpeechSynthesis, speakWord } from "../../utils/speech";
import { useSpeechSettings } from "../../hooks/useSpeechSettings";
import { useLazyGetRuleHintQuery } from "../../store/rules/api";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";

type TProps = {
  isLearning?: boolean;
  isOpenDefaultWordList?: boolean;
  pagination?: {
    currentPage: number;
    onPageChange: (page: number) => void;
    totalPages: number;
  };
  totalWords?: number;
  words: TWordResponse[];
};

export const DisplayWords: FC<TProps> = ({
  words,
  isOpenDefaultWordList,
  isLearning,
  pagination,
  totalWords,
}) => {
  const [showSection, setShowSection] = useState<"all" | "words">(
    isOpenDefaultWordList ? "words" : "all",
  );
  const [mode, setMode] = useState<"show" | "delete" | "edit">("show");
  const [wordForm, setWordForm] = useState<{
    origWord: string;
    translateWord: string;
    description: string;
    wordId?: number;
  }>({
    description: "",
    origWord: "",
    translateWord: "",
  });
  const [addWord, { isLoading: isAddWordLoading }] = useAddWordMutation();
  const [updateWord, { isLoading: isUpdateWordLoading }] =
    useUpdateWordMutation();
  const [getRuleHint] = useLazyGetRuleHintQuery();

  const [error, setError] = useState<null | string>(null);
  const [learningWords, setLearningWords] = useState<TWordResponse[]>([]);
  const [isInvalidateCacheWord, setIsInvalidateCacheWord] = useState(false);
  const [isOrigWordTouched, setIsOrigWordTouched] = useState(false);
  const { activeLanguage, selectedVoiceURI } = useSpeechSettings();

  const dispatch = useAppDispatch();
  const canPlayWord =
    isOrigWordTouched &&
    wordForm.origWord.trim().length > 0 &&
    canUseSpeechSynthesis();

  const handleCreateWord = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const ruleHint = wordForm.description.trim()
      ? null
      : activeLanguage.code === "en"
        ? await getRuleHint({ word: wordForm.origWord })
          .unwrap()
          .then((response) => response.hint)
          .catch(() => null)
        : null;
    const preparedDescription = wordForm.description.trim() || ruleHint || "";

    const response = await addWord({
      language: activeLanguage.code,
      orig_word: wordForm.origWord,
      translate_word: wordForm.translateWord,
      description: preparedDescription,
    });

    if ("data" in response && response.data) {
      setLearningWords([...learningWords, response.data]);
      setWordForm({ origWord: "", translateWord: "", description: "" });
      setIsOrigWordTouched(false);
      setIsInvalidateCacheWord(true);
    }
    if ("error" in response) {
      const responseError = getErrorText({
        error: response.error,
      });
      setError(responseError);
    }
  };

  const handleUpdateWord = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!wordForm.wordId) return;

    const response = await updateWord({
      language: activeLanguage.code,
      orig_word: wordForm.origWord,
      translate_word: wordForm.translateWord,
      description: wordForm.description,
      id: wordForm.wordId,
    });

    if ("data" in response && response.data) {
      setWordForm({ origWord: "", translateWord: "", description: "" });
      setIsOrigWordTouched(false);
      setIsInvalidateCacheWord(true);
    }
    if ("error" in response) {
      const responseError = getErrorText({
        error: response.error,
      });
      setError(responseError);
    }
  };

  useEffect(() => {
    return () => {
      if (isInvalidateCacheWord) {
        dispatch(wordsApi.util.invalidateTags(["LEARNING_WORDS"]));
      }
    };
  }, [dispatch, isInvalidateCacheWord]);

  useEffect(() => {
    if (words) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLearningWords(words);
    }
  }, [words]);

  return (
    <div>
      {showSection == "all" && (
        <form
          onSubmit={mode === "show" ? handleCreateWord : handleUpdateWord}
          className={classes.form}
        >
          <div className={classes.inputContainer}>
            <div className={classes.wordInputWrapper}>
              <input
                className={
                  error && error.includes("Слово") ? "error" : undefined
                }
                placeholder="Новое слово"
                id="origWord"
                name="origWord"
                autoFocus={!!wordForm?.wordId}
                type="text"
                required
                onFocus={(event) => !!wordForm?.wordId && event.target.focus()}
                onBlur={async () => {
                  const preparedWord = wordForm.origWord.trim();
                  setIsOrigWordTouched(preparedWord.length > 0);

                  if (
                    mode !== "show" ||
                    !preparedWord ||
                    wordForm.description.trim()
                  ) {
                    return;
                  }

                  const ruleHint =
                    activeLanguage.code === "en"
                      ? await getRuleHint({ word: preparedWord })
                          .unwrap()
                          .then((response) => response.hint)
                          .catch(() => null)
                      : null;

                  if (ruleHint) {
                    setWordForm((prev) => ({
                      ...prev,
                      description: prev.description.trim() || ruleHint,
                    }));
                  }
                }}
                value={wordForm.origWord}
                onChange={(e) => {
                  setError(null);
                  setIsOrigWordTouched(false);
                  setWordForm((prev) => ({
                    ...prev,
                    origWord: e.target.value,
                  }));
                }}
              />
              {canPlayWord && (
                <IconButton
                  className={classes.soundButton}
                  variant="ghost"
                  size="small"
                  aria-label="Воспроизвести слово"
                  title="Воспроизвести"
                  onClick={() =>
                    speakWord(
                      wordForm.origWord,
                      activeLanguage.speechLang,
                      selectedVoiceURI,
                    )
                  }
                >
                  <SoundOutlined size={20} />
                </IconButton>
              )}
            </div>
            <input
              className={
                error && error.includes("Перевод") ? "error" : undefined
              }
              placeholder="Перевод"
              id="translateWord"
              name="translateWord"
              type="text"
              required
              value={wordForm.translateWord}
              onChange={(e) => {
                setError(null);
                setWordForm((prev) => ({
                  ...prev,
                  translateWord: e.target.value,
                }));
              }}
            />
          </div>
          {error && <div className={classes.errorText}>{error}</div>}
          <div className={classes.textareaWrapper}>
            <textarea
              id="description"
              name="description"
              placeholder="Заметки к слову"
              value={wordForm.description}
              onChange={(e) =>
                setWordForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={classes.textarea}
            />
            {wordForm.description && (
              <IconButton
                className={classes.clearDescriptionButton}
                variant="input"
                size="small"
                aria-label="Очистить заметки к слову"
                title="Очистить"
                onClick={() =>
                  setWordForm((prev) => ({
                    ...prev,
                    description: "",
                  }))
                }
              >
                ×
              </IconButton>
            )}
          </div>
          <div className={classes.formActions}>
            <Button
              className={classes.button}
              variant="secondary"
              type="submit"
              disabled={isAddWordLoading || isUpdateWordLoading}
            >
              {mode === "edit" && wordForm.wordId
                ? "Сохранить изменения"
                : "Записать"}
            </Button>
          </div>
        </form>
      )}
      <ListWords
        words={learningWords}
        setShowSection={setShowSection}
        showSection={showSection}
        setMode={setMode}
        isLearning={isLearning}
        mode={mode}
        pagination={pagination}
        setWordForm={setWordForm}
        setIsInvalidateCacheWord={setIsInvalidateCacheWord}
        speechLang={activeLanguage.speechLang}
        selectedVoiceURI={selectedVoiceURI}
        totalWords={totalWords}
      />
    </div>
  );
};
