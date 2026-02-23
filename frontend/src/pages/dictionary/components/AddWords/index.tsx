import { useEffect, useState, type FormEvent } from "react";
import classes from "./index.module.css";
import { clsx } from "clsx";
import {
  useAddWordMutation,
  useLazyGetWordsQuery,
  useUpdateWordMutation,
  type TWordResponse,
} from "../../../../store/words/api";
import { getErrorText } from "../../../../store/utils/getErrorText";
import { ListWords } from "../listWords";

export const AddWords = () => {
  const [showSection, setShowSection] = useState<"all" | "words">("all");
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
  const [getWords, { data: words }] = useLazyGetWordsQuery();
  const [addWord, { isLoading: isAddWordLoading }] = useAddWordMutation();
  const [updateWord, { isLoading: isUpdateWordLoading }] =
    useUpdateWordMutation();

  const [error, setError] = useState<null | string>(null);
  const [learningWords, setLearningWords] = useState<TWordResponse[]>([]);

  const handleCreateWord = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await addWord({
      orig_word: wordForm.origWord,
      translate_word: wordForm.translateWord,
      description: wordForm.description,
    });

    if ("data" in response && response.data) {
      setLearningWords([...learningWords, response.data]);
      setWordForm({ origWord: "", translateWord: "", description: "" });
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
      orig_word: wordForm.origWord,
      translate_word: wordForm.translateWord,
      description: wordForm.description,
      id: wordForm.wordId,
    });

    if ("data" in response && response.data) {
      setWordForm({ origWord: "", translateWord: "", description: "" });
    }
    if ("error" in response) {
      const responseError = getErrorText({
        error: response.error,
      });
      setError(responseError);
    }
  };

  useEffect(() => {
    getWords();
  }, [getWords]);

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
            <input
              className={error && error.includes("Слово") ? "error" : undefined}
              placeholder="Новое слово"
              id="origWord"
              name="origWord"
              autoFocus={!!wordForm?.wordId}
              type="text"
              required
              onFocus={(event) => !!wordForm?.wordId && event.target.focus()}
              value={wordForm.origWord}
              onChange={(e) => {
                setError(null);
                setWordForm((prev) => ({
                  ...prev,
                  origWord: e.target.value,
                }));
              }}
            />
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
          <button
            className={clsx("btn btn-secondary", classes.button)}
            type="submit"
            disabled={isAddWordLoading || isUpdateWordLoading}
          >
            {mode === "edit" && wordForm.wordId
              ? "Сохранить изменения"
              : "Записать"}
          </button>
        </form>
      )}
      <ListWords
        words={learningWords}
        setShowSection={setShowSection}
        showSection={showSection}
        setMode={setMode}
        mode={mode}
        setWordForm={setWordForm}
      />
    </div>
  );
};
