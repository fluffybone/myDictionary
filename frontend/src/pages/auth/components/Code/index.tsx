import { useEffect, useRef, type FC } from "react";
import classes from "./index.module.css";
const NUMBER_COUNT_CODE = 6;

export const CODE_INPUTS = new Array(NUMBER_COUNT_CODE).fill("");

type TProps = {
  code: string[];
  setCode: (code: string[]) => void;
};

export const Code: FC<TProps> = ({ code, setCode }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    const newValues = [...code];
    newValues[index] = value;
    setCode(newValues);

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
    if (e.key === "Backspace" && !code[index] && index > 0) {
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
    <div className={classes.container}>
      {CODE_INPUTS.map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={code[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => {
            handleKeyDown(index, e);
          }}
          onPaste={(e) => {
            e.preventDefault();
            setCode([...e.clipboardData.getData("text")]);
            [...e.clipboardData.getData("text")].forEach((number, index) => {
              inputRefs.current[index]!.value = number;
            });
          }}
          inputMode="decimal"
          maxLength={1}
        />
      ))}
    </div>
  );
};
