import { useState, type ChangeEvent, type FC } from "react";
import classes from "./index.module.css";
import { clsx } from "clsx";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { IconButton } from "../../../../components/IconButton";

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
      <IconButton
        aria-label={label}
        className={classes.passwordIcon}
        onClick={() => setIsPasswordType(!isPasswordType)}
        variant="ghost"
        size="small"
      >
        {isPasswordType ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </IconButton>
    </div>
  );
};
