import { useState, type FC } from "react";
import classes from "./index.module.css";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

type TProps = {
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
};

export const PasswordInput: FC<TProps> = ({
  value,
  onChangeValue,
  placeholder,
}) => {
  const [isPasswordType, setIsPasswordType] = useState(true);

  return (
    <div className={classes.passwordInput}>
      <input
        type={isPasswordType ? "password" : "text"}
        onChange={(event) => onChangeValue(event.target.value)}
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
