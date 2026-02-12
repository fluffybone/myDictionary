import { useState, type ChangeEvent, type FC } from "react";
import classes from "./index.module.css";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { clsx } from "clsx";

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
      <div
        className={classes.passwordIcon}
        onClick={() => setIsPasswordType(!isPasswordType)}
      >
        {isPasswordType ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </div>
    </div>
  );
};
