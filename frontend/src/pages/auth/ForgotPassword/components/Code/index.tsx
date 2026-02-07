import { useEffect, useRef, useState } from "react";
import classes from "./index.module.css";
const NUMBER_COUNT_CODE = 6;

const CODE_INPUTS = new Array(NUMBER_COUNT_CODE).fill("");

export const Code = () => {
  const [values, setValues] = useState<string[]>(CODE_INPUTS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (value && index < NUMBER_COUNT_CODE - 1) {
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]!.focus();
        }
      }, 10);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    console.log("e.key", e.key);
    if (e.key === "Backspace" && !values[index] && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]!.focus();
      }
    }

    if (e.key === "ArrowRight" && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]!.focus();
    }

    if (e.key === "ArrowLeft" && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]!.focus();
    }
  };

  return (
    <div>
      <div className={classes.container}>
        {CODE_INPUTS.map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={values[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => {
              handleKeyDown(index, e);
            }}
            onPaste={(e) => {
              e.preventDefault();
              setValues([...e.clipboardData.getData("text")]);
              [...e.clipboardData.getData("text")].forEach((number, index) => {
                inputRefs.current[index]!.value = number;
              });
            }}
            inputMode="decimal"
            maxLength={1}
          />
        ))}
      </div>
    </div>
  );
};
