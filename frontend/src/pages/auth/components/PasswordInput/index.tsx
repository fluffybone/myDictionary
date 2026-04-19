import { useState, type ChangeEvent, type FC } from "react";
import classes from "./index.module.css";
import { clsx } from "clsx";
import { EyeIcon, EyeOffIcon } from "../../../../components/icons";

type TProps = {
  value: string;
  onChangeValue: (value: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  id: string;
  name: string;
  isRequired?: boolean;
};

export const PasswordInput: FC<TProps> = ({
  value,
  onChangeValue,
  placeholder,
  className,
  isRequired,
  id,
  name,
}) => {
  const [isPasswordType, setIsPasswordType] = useState(true);
  const label = isPasswordType ? "Показать пароль" : "Скрыть пароль";

  return (
    <div className={clsx(classes.passwordInput, className)}>
      <input
        id={id}
        name={name}
        required={isRequired}
        type={isPasswordType ? "password" : "text"}
        onChange={onChangeValue}
        value={value}
        placeholder={placeholder}
      />
      <button
        aria-label={label}
        className={classes.passwordIcon}
        onClick={() => setIsPasswordType(!isPasswordType)}
        type="button"
      >
        {isPasswordType ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};
