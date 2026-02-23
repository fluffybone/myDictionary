import type { ComponentProps, FC } from "react";
import classes from "./index.module.css";

export const Checkbox: FC<
  ComponentProps<"input"> & {
    label?: string;
    error?: string;
    className?: string;
  }
> = ({ label, error, className, disabled, checked, onChange, ...props }) => {
  return (
    <div className={className}>
      <label className={`${classes.checkboxContainer} ${error ? "error" : ""}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        <span className={classes.checkboxCustom}>
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        {label && <span className={classes.checkboxLabel}>{label}</span>}
      </label>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
