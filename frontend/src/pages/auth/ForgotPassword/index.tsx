import { Link } from "react-router-dom";
import { clsx } from "clsx";
import classes from "../index.module.css";
import { useState } from "react";
import { Code } from "./components/Code";
import { PasswordInput } from "../components/PasswordInput";

const BUTTON_TEXT_BY_STEP: Record<number, string> = {
  1: "Продолжить",
  2: "Отправить",
  3: "Подтвердить",
};

export const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [value, setValue] = useState("");
  return (
    <>
      <h1>
        Восстановление пароля <br /> в WordEater 🍥
      </h1>
      <div className={clsx(classes.authCard, "card")}>
        {step === 2 && (
          <p className={clsx(classes.authText, classes.back)}>
            <Link to="/auth/forgot-password" onClick={() => setStep(1)}>
              ← Назад
            </Link>
          </p>
        )}
        <div className={clsx(classes.wrapper)}>
          {step === 1 && (
            <div>
              <label className="label">Введите почту</label>
              <input
                type="text"
                placeholder="почта на которую регистрировались"
                inputMode="email"
              />
            </div>
          )}
          {step == 2 && (
            <>
              <p className={classes.forgotText}>
                На Вашу почту отправлен код, введите его чтобы поменять пароль
              </p>
              <Code />
            </>
          )}
          {step == 3 && (
            <>
              <p className={classes.forgotText}>Введите новый пароль</p>
              <PasswordInput value={value} onChangeValue={setValue} />
            </>
          )}
          <button
            className={clsx(classes.button, "btn btn-secondary")}
            onClick={() => {
              if (step !== 3) {
                setStep(step + 1);
              }
            }}
          >
            {BUTTON_TEXT_BY_STEP[step]}
          </button>
          <p className={classes.authText}>
            <Link to="/auth/login">Войти</Link> или{" "}
            <Link to="/auth/registration">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </>
  );
};
