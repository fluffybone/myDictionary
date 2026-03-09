import { type FC, type InputHTMLAttributes } from "react";
import classes from "../index.module.css";
import clsx from "clsx";

type RadioProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  className?: string;
  name: string;
  value: string;
};

export const Radio: FC<RadioProps> = ({
  label,
  error,
  className = "",
  id,
  name,
  value,
  checked,
  onChange,
  disabled,
  ...props
}) => {
  const radioId = id || `radio-${name}-${value}`;

  return (
    <div
      className={clsx(
        classes.radioWrapper,
        { [classes.error]: error },
        className,
      )}
    >
      <label
        htmlFor={radioId}
        className={clsx(classes.radio, { [classes.disabled]: disabled })}
      >
        <input
          type="radio"
          id={radioId}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        <span className={classes.radioIndicator} />
        {label && <span className={classes.radioLabel}>{label}</span>}
      </label>
      {error && <span className={classes.errorMessage}>{error}</span>}
    </div>
  );
};
