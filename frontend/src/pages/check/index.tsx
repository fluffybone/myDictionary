import { useEffect, useState, type FormEvent } from "react";
import { RadioGroup } from "../../components/RadioComponents/RadioGroup";
import classes from "./index.module.css";
import { useGetWordsQuery, type TWordResponse } from "../../store/words/api";
import clsx from "clsx";
import { CloseOutlined } from "@ant-design/icons";

export const Check = () => {
  const [selectedOption, setSelectedOption] = useState("origWord");
  const { data: words } = useGetWordsQuery();
  const [isViewResult, setIsViewResult] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<TWordResponse[]>();

  const [wordResult, setWordResult] = useState<Record<
    string,
    { answer: string; correctAnswer: string }
  > | null>(null);

  useEffect(() => {
    if (words) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShuffledWords([...words].sort(() => Math.random() - 0.5));
    }
  }, [words]);

  if (!shuffledWords) {
    return;
  }

  const hadleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsWin(false);
    setIsViewResult(true);
    if (!wordResult) return;
    let hasErrorInSubmit = false;
    for (const [, value] of Object.entries(wordResult)) {
      if (value.answer !== value.correctAnswer) {
        hasErrorInSubmit = true;
        setHasError(true);
      }
    }
    if (!hasErrorInSubmit) {
      setIsWin(true);
    }
  };

  console.log("wordResult", wordResult);
  return (
    <div>
      <h3>
        Проверить себя по списку:
        <span className={classes.list}>Сейчас учу</span>
      </h3>
      <div className={classes.container}>
        <p className={classes.text}>Пишу</p>
        <div className={classes.block}>
          <RadioGroup
            className={classes.radio}
            name="options"
            value={selectedOption}
            onChange={(value) => {
              setSelectedOption(value);
              setWordResult(null);
              setIsViewResult(false);
            }}
            options={[
              { value: "origWord", label: "Слово" },
              { value: "translateWord", label: "Перевод слова" },
            ]}
            horizontal
          />
        </div>
      </div>
      <form
        onSubmit={hadleSubmit}
        className={classes.form}
        key={selectedOption}
      >
        {isWin && (
          <div className={classes.blockWin}>
            <h3>Правильно! 🎉🎉🎉 </h3>
            <button
              className={clsx("btn btn-primary btn-small", classes.close)}
              onClick={() => {
                setIsWin(false);
                setWordResult(null);
              }}
            >
              <CloseOutlined size={24} />
            </button>
            {/* <button className={clsx("btn btn-secondary", classes.buttonWrite)}>
              Записать в словарь
            </button> */}
          </div>
        )}
        <div
          className={clsx(classes.tableContainer, { [classes.isWin]: isWin })}
        >
          <table className={classes.table}>
            <tbody>
              {shuffledWords.map((word) => {
                const key =
                  selectedOption === "origWord"
                    ? "orig_word"
                    : "translate_word";

                const keyRightWord =
                  selectedOption === "origWord"
                    ? "translate_word"
                    : "orig_word";

                return (
                  <tr key={word.id} className={classes.tableTr}>
                    <td className={classes.wordTd}>{word[key]}</td>
                    <td className={classes.wordTd}>
                      <input
                        className={
                          isViewResult &&
                          wordResult &&
                          hasError &&
                          wordResult[word[key]].answer !==
                            wordResult[word[key]].correctAnswer
                            ? "error"
                            : undefined
                        }
                        required
                        name={word[key]}
                        onChange={(value) => {
                          setHasError(false);
                          setWordResult({
                            ...wordResult,
                            [word[key]]: {
                              answer: value.target.value,
                              correctAnswer: word[keyRightWord],
                            },
                          });
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isWin && (
          <button
            className={clsx(classes.button, "btn btn-secondary")}
            type="submit"
          >
            Отправить
          </button>
        )}
      </form>
    </div>
  );
};
