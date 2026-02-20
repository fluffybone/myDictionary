import { type KeyboardEvent, useEffect, useRef } from "react";
import cx from "clsx";
import classes from "./index.module.css";
const DIGITS_COUNT = 6;

export const AuthenticationCodeInput = ({
  className,
  onChange,
  value,
}: {
  className?: string;
  error?: string;
  onChange: (value: string[]) => void;
  value: string[];
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (digitValue: string, digitIndex: number) => {
    const withoutLetterValue = digitValue.replace(/[^\d]/gi, "");
    const newValues = [...value];
    newValues[digitIndex] = withoutLetterValue;

    onChange(newValues);

    if (withoutLetterValue && digitIndex < DIGITS_COUNT - 1) {
      inputRefs.current[digitIndex + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    digitIndex: number,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      handleChange("", digitIndex);
      inputRefs.current[digitIndex - 1]?.focus();
    }

    if (event.key === "ArrowRight") {
      inputRefs.current[digitIndex + 1]?.focus();
    }

    if (event.key === "ArrowLeft") {
      inputRefs.current[digitIndex - 1]?.focus();
    }
  };

  return (
    <div className={cx(classes.container, className)}>
      {new Array(DIGITS_COUNT).fill("").map((_, digitIndex) => (
        <input
          key={digitIndex}
          maxLength={1}
          name={"code" + digitIndex}
          onChange={(digitValue) =>
            handleChange(digitValue.target.value, digitIndex)
          }
          onKeyDown={(event) => handleKeyDown(event, digitIndex)}
          onPaste={(event) => {
            event.preventDefault();
            const withoutLetterValue = event.clipboardData
              .getData("text")
              .replace(/[^\d]/gi, "");
            onChange([...withoutLetterValue]);
          }}
          ref={(element) => {
            inputRefs.current[digitIndex] = element;
          }}
          value={value[digitIndex] ?? ""}
        />
      ))}
    </div>
  );
};
