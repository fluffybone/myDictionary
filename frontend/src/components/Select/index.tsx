import type { ComponentProps, FC, ReactNode } from "react";
import clsx from "clsx";
import classes from "./index.module.css";

type TSelectOption = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

type TSelectProps = Omit<ComponentProps<"select">, "children" | "size"> & {
  className?: string;
  error?: string;
  label?: string;
  options: TSelectOption[];
  placeholder?: string;
  selectClassName?: string;
  size?: "medium" | "small";
};

export const Select: FC<TSelectProps> = ({
  className,
  disabled,
  error,
  id,
  label,
  options,
  placeholder,
  required,
  selectClassName,
  size = "medium",
  value,
  ...props
}) => {
  const selectId = id ?? props.name;

  return (
    <div className={clsx(classes.container, className)}>
      {label && (
        <label className={classes.label} htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className={classes.selectWrapper}>
        <select
          className={clsx(
            classes.select,
            { [classes.small]: size === "small" },
            { [classes.error]: error },
            selectClassName,
          )}
          disabled={disabled}
          id={selectId}
          required={required}
          value={value}
          {...props}
        >
          {placeholder && (
            <option disabled={required} value="">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              disabled={option.disabled}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className={classes.chevron} aria-hidden="true" />
      </div>
      {error && <span className={classes.errorMessage}>{error}</span>}
    </div>
  );
};
