import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
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
import { useSpeechSettings } from "../../hooks/useSpeechSettings";

type TCheckWordsSource = "learning" | "learned";
type TSelectedOption = "origWord" | "translateWord";
type TWordResult = Record<
  number,
  { answer: string; correctAnswer: string; sourceWordId?: number }
>;
type TTranslationChip = { id: number; text: string };

const formatDateLabel = (date: string) => date.split("-").reverse().join(".");

const getNormalizedAnswerVariants = (value: string) => {
  const preparedValue = value.trim().toLocaleLowerCase().replaceAll("ё", "е");
  const softVariant = preparedValue
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const germanVariant = preparedValue
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return new Set([softVariant, germanVariant]);
};

const isSameAnswer = (answer: string, correctAnswer: string) => {
  const answerVariants = getNormalizedAnswerVariants(answer);
  const correctAnswerVariants = getNormalizedAnswerVariants(correctAnswer);

  return [...answerVariants].some((variant) => correctAnswerVariants.has(variant));
};

const waitForNextTick = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

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
  const answerMode =
    selectedOption === "origWord" ? ("choice" as const) : ("write" as const);
  const [wordsSource, setWordsSource] = useState<TCheckWordsSource>("learning");
  const [dateRange, setDateRange] = useState(getCurrentMonthRange);
  const { activeLanguage } = useSpeechSettings();
  const {
    data: words,
    isError,
    isLoading,
  } = useGetWordsQuery({
    dateFrom: wordsSource === "learned" ? dateRange.dateFrom : undefined,
    dateTo: wordsSource === "learned" ? dateRange.dateTo : undefined,
    isLearning: wordsSource === "learning",
    language: activeLanguage.code,
    limit: 100,
    random: true,
  });
  const [isViewResult, setIsViewResult] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitLoader, setShowSubmitLoader] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<TWordResponse[]>();
  const [selectedChip, setSelectedChip] = useState<TTranslationChip | null>(null);
  const draggedChipRef = useRef<TTranslationChip | null>(null);

  const [addedWordsInDictionary] = useUpdateLearningStatusWordMutation();

  const [wordResult, setWordResult] = useState<TWordResult>({});

  useEffect(() => {
    if (words) {
      setShuffledWords([...words.items].sort(() => Math.random() - 0.5));
    }
  }, [words]);

  useEffect(() => {
    setWordResult({});
    setSelectedChip(null);
    setIsViewResult(false);
    setHasError(false);
    setIsWin(false);
  }, [
    activeLanguage.code,
    dateRange.dateFrom,
    dateRange.dateTo,
    wordsSource,
  ]);

  const translationChips = useMemo(
    () =>
      shuffledWords
        ? shuffle(
            shuffledWords.map((word) => ({
              id: word.id,
              text: word.translate_word,
            })),
          )
        : [],
    [shuffledWords],
  );

  const usedChipIds = useMemo(
    () =>
      new Set(
        Object.values(wordResult)
          .map((result) => result.sourceWordId)
          .filter((id): id is number => id !== undefined),
      ),
    [wordResult],
  );

  const bankChips = translationChips.filter(
    (chip) => !usedChipIds.has(chip.id),
  );

  const assignChipToWord = (word: TWordResponse, chip: TTranslationChip) => {
    setHasError(false);
    setSelectedChip(null);
    setWordResult((prev) => ({
      ...prev,
      [word.id]: {
        answer: chip.text,
        correctAnswer: word.translate_word,
        sourceWordId: chip.id,
      },
    }));
  };

  const unassignChip = (chipId: number) => {
    setHasError(false);
    setWordResult((prev) => {
      const next = { ...prev };

      for (const [wordId, result] of Object.entries(next)) {
        if (result.sourceWordId === chipId) delete next[Number(wordId)];
      }

      return next;
    });
  };

  const startChipDrag = (
    event: DragEvent<HTMLButtonElement>,
    chip: TTranslationChip,
  ) => {
    draggedChipRef.current = chip;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(chip.id));
  };

  const stopChipDrag = () => {
    draggedChipRef.current = null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsWin(false);
    setIsViewResult(true);
    const loaderTimeoutId = window.setTimeout(() => {
      setShowSubmitLoader(true);
    }, 250);

    try {
      let hasErrorInSubmit = false;

      if (shuffledWords?.length) {
        for (const [index, word] of shuffledWords.entries()) {
          if (index > 0 && index % 20 === 0) {
            await waitForNextTick();
          }

          const result = wordResult[word.id];

          if (!result || !isSameAnswer(result.answer, result.correctAnswer)) {
            hasErrorInSubmit = true;
            break;
          }
        }
      }

      setHasError(hasErrorInSubmit);
      setIsWin(!hasErrorInSubmit);
    } finally {
      window.clearTimeout(loaderTimeoutId);
      setShowSubmitLoader(false);
      setIsSubmitting(false);
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
      !isSameAnswer(result.answer, result.correctAnswer)
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
                setSelectedChip(null);
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
          {showSubmitLoader && (
            <div className={classes.loaderOverlay} role="status" aria-live="polite">
              <div className={classes.loaderCard}>
                <div className={classes.loaderSpinner} aria-hidden="true" />
                <span>Проверяем ответы...</span>
              </div>
            </div>
          )}
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
          {answerMode === "choice" && !isWin && (
            <p className={classes.hint}>
              Перетащите перевод к слову или выберите вариант и нажмите на
              слово
            </p>
          )}
          <div
            className={clsx(classes.tableContainer, { [classes.isWin]: isWin })}
          >
            {answerMode === "choice" ? (
              <div className={classes.matchBoard}>
                <div className={classes.wordsColumn}>
                  {shuffledWords.map((word) => {
                    const result = wordResult[word.id];
                    const isWrong = isAnswerError(word);
                    const isCorrect =
                      Boolean(result) && isViewResult && hasError && !isWrong;

                    return (
                      <div
                        key={word.id}
                        className={clsx(classes.matchRow, {
                          [classes.matchRowFilled]: Boolean(result),
                          [classes.matchRowError]: isWrong,
                          [classes.matchRowCorrect]: isCorrect,
                        })}
                        onClick={() => {
                          if (selectedChip) {
                            assignChipToWord(word, selectedChip);
                          }
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const chip = draggedChipRef.current;
                          if (chip) assignChipToWord(word, chip);
                          draggedChipRef.current = null;
                        }}
                      >
                        <span className={classes.matchWord}>
                          {word.orig_word}
                        </span>
                        <div className={classes.matchSlot}>
                          {result ? (
                            <button
                              type="button"
                              draggable={!isSubmitting && !isWin}
                              title="Перетащите к другому слову или нажмите, чтобы убрать"
                              className={clsx(
                                classes.option,
                                classes.assignedChip,
                                {
                                  [classes.optionCorrect]: isCorrect,
                                  [classes.optionWrong]: isWrong,
                                },
                              )}
                              onDragStart={(event) =>
                                startChipDrag(event, {
                                  id: result.sourceWordId ?? word.id,
                                  text: result.answer,
                                })
                              }
                              onDragEnd={stopChipDrag}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (result.sourceWordId !== undefined) {
                                  unassignChip(result.sourceWordId);
                                }
                              }}
                            >
                              {result.answer}
                              <span
                                className={classes.chipRemove}
                                aria-hidden="true"
                              >
                                ×
                              </span>
                            </button>
                          ) : (
                            <span className={classes.matchPlaceholder}>
                              Перетащите перевод
                            </span>
                          )}
                        </div>
                        {isWrong && (
                          <span className={classes.correctHint}>
                            {word.translate_word}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div
                  className={classes.bank}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const chip = draggedChipRef.current;
                    if (chip) unassignChip(chip.id);
                    draggedChipRef.current = null;
                  }}
                >
                  <p className={classes.bankTitle}>Варианты перевода</p>
                  <div className={classes.bankChips}>
                    {bankChips.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        draggable={!isSubmitting && !isWin}
                        className={clsx(classes.option, classes.bankChip, {
                          [classes.optionSelected]: selectedChip?.id === chip.id,
                        })}
                        onDragStart={(event) => startChipDrag(event, chip)}
                        onDragEnd={stopChipDrag}
                        onClick={() =>
                          setSelectedChip((prev) =>
                            prev?.id === chip.id ? null : chip,
                          )
                        }
                      >
                        {chip.text}
                      </button>
                    ))}
                    {!bankChips.length && (
                      <span className={classes.bankEmpty}>
                        Все переводы распределены
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <table className={classes.table}>
                <tbody>
                  {shuffledWords.map((word) => {
                    const key = "translate_word";
                    const keyRightWord = "orig_word";

                    return (
                      <tr key={word.id} className={classes.tableTr}>
                        <td className={classes.wordTd}>{word[key]}</td>
                        <td className={classes.wordTd}>
                          <input
                            autoComplete="off"
                            className={
                              isAnswerError(word) ? "error" : undefined
                            }
                            disabled={isSubmitting}
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
            )}
            {!isWin && (
              <Button
                className={classes.button}
                variant="secondary"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Проверяем..." : "Отправить"}
              </Button>
            )}
          </div>

        </form>
      )}
    </div>
  );
};
