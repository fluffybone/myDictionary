import { useState } from "react";
import classes from "./index.module.css";
import { clsx } from "clsx";

export const AddWords = () => {
  const [values, setValues] = useState<{
    enWord: string;
    ruWord: string;
    description: string;
  }>({
    description: "",
    ruWord: "",
    enWord: "",
  });

  return (
    <div className={classes.wordsContainer}>
      <form>
        <div className={classes.inputContainer}>
          <input
            //   className={emailError && "error"}
            placeholder="Новое слово"
            id="enWord"
            name="enWord"
            type="text"
            autoFocus
            required
            value={values.enWord}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                enWord: e.target.value,
              }))
            }
          />
          <input
            //   className={emailError && "error"}
            placeholder="Перевод"
            id="ruWord"
            name="ruWord"
            type="text"
            required
            value={values.enWord}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                ruWord: e.target.value,
              }))
            }
          />
        </div>
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
        />
        <button
          className={clsx("btn btn-secondary", classes.button)}
          type="submit"
        >
          Записать
        </button>
      </form>
      <div className={classes.learnWords}>Сейчас учу</div>
    </div>
  );
};
