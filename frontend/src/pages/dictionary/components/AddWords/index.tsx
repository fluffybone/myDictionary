import { useEffect, useState, type FormEvent } from "react";
import classes from "./index.module.css";
import { clsx } from "clsx";
import {
  useAddWordMutation,
  useLazyGetWordsQuery,
  type TWordResponse,
} from "../../../../store/words/api";
import { getErrorText } from "../../../../store/utils/getErrorText";
import { ListWords } from "../listWords";

export const AddWords = () => {
  const [values, setValues] = useState<{
    origWord: string;
    translateWord: string;
    description: string;
  }>({
    description: "",
    origWord: "",
    translateWord: "",
  });
  const [addWord, { isLoading }] = useAddWordMutation();
  const [error, setError] = useState<null | string>(null);
  const [getWords, { data: words }] = useLazyGetWordsQuery();
  const [learningWords, setLearningWords] = useState<TWordResponse[]>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await addWord({
      orig_word: values.origWord,
      translate_word: values.translateWord,
      description: values.description,
    });

    if ("data" in response && response.data) {
      setLearningWords([...learningWords, response.data]);
      setValues({ origWord: "", translateWord: "", description: "" });
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
      <form onSubmit={handleSubmit}>
        <div className={classes.inputContainer}>
          <input
            className={error && error.includes("Слово") ? "error" : undefined}
            placeholder="Новое слово"
            id="origWord"
            name="origWord"
            type="text"
            autoFocus
            required
            value={values.origWord}
            onChange={(e) => {
              setError(null);
              setValues((prev) => ({
                ...prev,
                origWord: e.target.value,
              }));
            }}
          />
          <input
            className={error && error.includes("Перевод") ? "error" : undefined}
            placeholder="Перевод"
            id="translateWord"
            name="translateWord"
            type="text"
            required
            value={values.translateWord}
            onChange={(e) => {
              setError(null);
              setValues((prev) => ({
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
          value={values.description}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          className={classes.textarea}
        />
        <button
          className={clsx("btn btn-secondary", classes.button)}
          type="submit"
          disabled={isLoading}
        >
          Записать
        </button>
      </form>
      <div className={classes.learningWordsContainer}>
        <p className={classes.count}>{learningWords.length} / 20</p>
        <div className={classes.learnWords}>
          <ListWords words={learningWords} />
        </div>
      </div>
    </div>
  );
};
