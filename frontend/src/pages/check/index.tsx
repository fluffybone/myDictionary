import { useEffect, useState, type FormEvent } from "react";
import { RadioGroup } from "../../components/RadioComponents/RadioGroup";
import classes from "./index.module.css";
import {
  useGetWordsQuery,
  useUpdateLearningStatusWordMutation,
  type TWordResponse,
} from "../../store/words/api";
import clsx from "clsx";
import { CloseOutlined } from "@ant-design/icons";
import { Select } from "../../components/Select";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { getCurrentMonthRange } from "../../utils/dateRange";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";

type TCheckWordsSource = "learning" | "learned";
type TSelectedOption = "origWord" | "translateWord";
type TWordResult = Record<number, { answer: string; correctAnswer: string }>;

const formatDateLabel = (date: string) => date.split("-").reverse().join(".");

const normalizeAnswer = (value: string) =>
  value.trim().toLocaleLowerCase().replaceAll("ё", "е");

const getEmptyMessage = (
  wordsSource: TCheckWordsSource,
  dateRange: { dateFrom: string; dateTo: string },
) => {
  if (wordsSource === "learned") {
    return `За период ${formatDateLabel(dateRange.dateFrom)} — ${formatDateLabel(
      dateRange.dateTo,
    )} выученных слов не найдено. Попробуйте выбрать другой период.`;
  }

  if (wordsSource === "learning") return "Добавьте слова для изучения";

  return "Добавьте слова";
};

export const Check = () => {
  const [selectedOption, setSelectedOption] =
    useState<TSelectedOption>("origWord");
  const [wordsSource, setWordsSource] = useState<TCheckWordsSource>("learning");
  const [dateRange, setDateRange] = useState(getCurrentMonthRange);
  const {
    data: words,
    isError,
    isLoading,
  } = useGetWordsQuery({
    dateFrom: wordsSource === "learned" ? dateRange.dateFrom : undefined,
    dateTo: wordsSource === "learned" ? dateRange.dateTo : undefined,
    isLearning: wordsSource === "learning",
    limit: 100,
    random: true,
  });
  const [isViewResult, setIsViewResult] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<TWordResponse[]>();

  const [addedWordsInDictionary] = useUpdateLearningStatusWordMutation();

  const [wordResult, setWordResult] = useState<TWordResult>({});

  useEffect(() => {
    if (words) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShuffledWords([...words.items].sort(() => Math.random() - 0.5));
    }
  }, [words]);

  useEffect(() => {
    setWordResult({});
    setIsViewResult(false);
    setHasError(false);
    setIsWin(false);
  }, [dateRange.dateFrom, dateRange.dateTo, wordsSource]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsWin(false);
    setIsViewResult(true);

    const hasErrorInSubmit = shuffledWords?.some((word) => {
      const result = wordResult[word.id];

      return (
        !result ||
        normalizeAnswer(result.answer) !== normalizeAnswer(result.correctAnswer)
      );
    });

    setHasError(Boolean(hasErrorInSubmit));

    if (!hasErrorInSubmit) {
      setIsWin(true);
    }
  };

  if (isLoading || !shuffledWords) {
    return <h2>Загружаем слова...</h2>;
  }

  if (isError || !words) {
    return <h2>Не удалось загрузить слова</h2>;
  }

  const isEmptyWords = words.items.length === 0;
  const canMoveWordsToLearned = wordsSource === "learning";
  const isAnswerError = (word: TWordResponse) => {
    if (!isViewResult || !hasError) return false;

    const result = wordResult[word.id];

    return (
      !result ||
      normalizeAnswer(result.answer) !== normalizeAnswer(result.correctAnswer)
    );
  };

  return (
    <div>
      <div className={classes.settings}>
        <div className={classes.container}>
          <p className={classes.text}>Пишу</p>
          <div className={classes.block}>
            <RadioGroup
              className={classes.radio}
              name="options"
              value={selectedOption}
              onChange={(value) => {
                setSelectedOption(value as TSelectedOption);
                setWordResult({});
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
        <Select
          className={classes.listSelect}
          name="wordsSource"
          value={wordsSource}
          label="Список"
          size="small"
          onChange={(event) => {
            setWordsSource(event.target.value as TCheckWordsSource);
          }}
          options={[
            { value: "learning", label: "Сейчас учу" },
            { value: "learned", label: "По выученным" },
          ]}
        />
        {wordsSource === "learned" && (
          <DateRangeFilter
            dateFrom={dateRange.dateFrom}
            dateTo={dateRange.dateTo}
            onDateFromChange={(dateFrom) =>
              setDateRange((prev) => ({ ...prev, dateFrom }))
            }
            onDateToChange={(dateTo) =>
              setDateRange((prev) => ({ ...prev, dateTo }))
            }
          />
        )}
      </div>
      {isEmptyWords && (
        <div className={classes.addedWordBlock}>
          <h3 className={classes.addedWordTitle}>
            {getEmptyMessage(wordsSource, dateRange)}
          </h3>
        </div>
      )}
      {!isEmptyWords && (
        <form
          onSubmit={handleSubmit}
          className={classes.form}
          key={`${selectedOption}-${wordsSource}-${isWin}`}
        >
          {isWin && (
            <div className={classes.blockWin}>
              <h3>Правильно! 🎉🎉🎉 </h3>
              <IconButton
                className={classes.close}
                variant="ghost"
                size="medium"
                onClick={() => {
                  setIsWin(false);
                  setWordResult({});
                }}
              >
                <CloseOutlined size={24} />
              </IconButton>
              <div className={classes.writeBlock}>
                {canMoveWordsToLearned
                  ? "Записать выученные слова?"
                  : "Тренировка завершена"}
              </div>
              {canMoveWordsToLearned ? (
                <div className={classes.buttonActionAfterTest}>
                  <Button
                    onClick={() => {
                      setIsWin(false);
                      setWordResult({});
                    }}
                    variant="secondary"
                    size="small"
                  >
                    Пока нет
                  </Button>
                  <Button
                    onClick={async () => {
                      const response = await addedWordsInDictionary({
                        wordsIds: words.items.map((item) => item.id),
                      });
                      if (response) {
                        setIsWin(false);
                        setWordResult({});
                      }
                    }}
                    variant="primary"
                    size="small"
                  >
                    Да
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setIsWin(false);
                    setWordResult({});
                  }}
                  className={classes.doneButton}
                  variant="primary"
                  size="small"
                >
                  Готово
                </Button>
              )}
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
                          autoComplete="off"
                          className={isAnswerError(word) ? "error" : undefined}
                          placeholder="Ваш ответ"
                          required
                          name={word[key]}
                          onChange={(event) => {
                            setHasError(false);
                            setWordResult((prev) => ({
                              ...prev,
                              [word.id]: {
                                answer: event.target.value,
                                correctAnswer: word[keyRightWord],
                              },
                            }));
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
            <Button
              className={classes.button}
              variant="secondary"
              type="submit"
            >
              Отправить
            </Button>
          )}
        </form>
      )}
    </div>
  );
};
