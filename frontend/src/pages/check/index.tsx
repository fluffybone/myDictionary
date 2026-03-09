import { useState, type FormEvent } from "react";
import { RadioGroup } from "../../components/RadioComponents/RadioGroup";
import classes from "./index.module.css";
import { useGetWordsQuery } from "../../store/words/api";
import clsx from "clsx";

export const Check = () => {
  const [selectedOption, setSelectedOption] = useState("origWord");
  const { data: words } = useGetWordsQuery();

  const [wordResult, setWordResult] =
    useState<Record<string, { answer: string; correctAnswer: string }>>();

  if (!words) {
    return;
  }

  const hadleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("gggg", wordResult);
  };

  return (
    <div>
      <h3>
        Проверить себя по списку:{" "}
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
              // if (value === "origWord") {
              //   setShowWords(words.map((word) => word.translate_word));
              // }
              // if (value === "translateWord") {
              //   setShowWords(words.map((word) => word.orig_word));
              // }
            }}
            options={[
              { value: "origWord", label: "Слово" },
              { value: "translateWord", label: "Перевод слова" },
            ]}
            horizontal
          />
        </div>
      </div>
      <form onSubmit={hadleSubmit}>
        <div className={classes.tableContainer}>
          <table className={classes.table}>
            <tbody>
              {words.map((word) => {
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
                        required
                        name={word[key]}
                        onChange={(value) =>
                          setWordResult({
                            ...wordResult,
                            [word[key]]: {
                              answer: value.target.value,
                              correctAnswer: word[keyRightWord],
                            },
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            className={clsx(classes.button, "btn btn-secondary")}
            type="submit"
          >
            Отправить
          </button>
        </div>
      </form>
    </div>
  );
};
