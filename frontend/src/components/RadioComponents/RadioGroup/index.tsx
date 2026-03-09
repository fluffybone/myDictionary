import { Radio } from "../Radio";
import classes from "../index.module.css";
import clsx from "clsx";

type TRadioGroupProps = {
  name: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  horizontal?: boolean;
};
export const RadioGroup: React.FC<TRadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  error,
  disabled,
  className = "",
  horizontal = false,
}) => {
  return (
    <div className={clsx(classes.radioGroup, className)}>
      <div
        className={clsx(classes.radioGroupContainer, {
          [classes.horizontal]: horizontal,
        })}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        ))}
      </div>
      {error && <span className={classes.errorMessage}>{error}</span>}
    </div>
  );
};
