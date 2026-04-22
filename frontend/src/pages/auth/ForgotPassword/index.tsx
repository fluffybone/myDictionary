import { Link } from "react-router-dom";
import { clsx } from "clsx";
import classes from "../index.module.css";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "../components/PasswordInput";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../../store/authorization/api";
import { getErrorText } from "../../../store/utils/getErrorText";
import { AuthenticationCodeInput } from "../components/AuthenticationCodeInput";
import { Button } from "../../../components/Button";

const BUTTON_TEXT_BY_STEP: Record<number, string> = {
  1: "Продолжить",
  2: "Отправить",
  3: "Подтвердить",
};

export const ForgotPassword = () => {
  const [step, setStep] = useState<number>(1);
  const [passwordValue, setPasswordValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [code, setCode] = useState(new Array(6).fill(""));

  const [
    forgotPassword,
    { isLoading: isForgotPasswordLoading, error: forgotPasswordError },
  ] = useForgotPasswordMutation();

  const [
    resetPassword,
    { isLoading: isResetPasswordLoading, error: resetPasswordError },
  ] = useResetPasswordMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1 && emailValue.length > 0) {
      const response = await forgotPassword({ email: emailValue });
      if ("data" in response) {
        setStep(2);
      }
    }
    if (step === 2 && passwordValue.length > 0) {
      setStep(3);
    }
    if (step === 3 && code.join("").length > 0 && passwordValue.length > 0) {
      const response = await resetPassword({
        new_password: passwordValue,
        email: emailValue,
        code: code.join(""),
      });
      if ("data" in response) {
        setStep(4);
      }
    }
  };

  const forgotErrorText = getErrorText({ error: forgotPasswordError });
  const resetPasswordErrorText = getErrorText({ error: resetPasswordError });

  return (
    <>
      <h1>
        Восстановление пароля <br /> в WordEater 🍥
      </h1>
      <div className={clsx(classes.authCard, "card")}>
        {step === 4 && (
          <p className={clsx(classes.infoText, classes.success)}>
            Вы успешно сменили пароль!
          </p>
        )}
        {(step === 2 || step === 3) && (
          <p className={clsx(classes.authText, classes.back)}>
            <Link to="/auth/forgot-password" onClick={() => setStep(step - 1)}>
              ← Назад
            </Link>
          </p>
        )}
        {(forgotErrorText || resetPasswordErrorText) && (
          <div className={classes.errorText}>
            {forgotErrorText || resetPasswordErrorText}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={clsx(classes.wrapper)}>
            {step === 1 && (
              <div>
                <label className="label">Введите почту</label>
                <input
                  type="text"
                  placeholder="почта на которую регистрировались"
                  inputMode="email"
                  required
                  value={emailValue}
                  className={forgotErrorText && "error"}
                  onChange={(e) => setEmailValue(e.target.value)}
                />
              </div>
            )}
            {step == 2 && (
              <>
                <p className={classes.infoText}>Введите новый пароль</p>
                <PasswordInput
                  value={passwordValue}
                  onChangeValue={(e) => setPasswordValue(e.target.value)}
                  isRequired
                  id="password"
                  name="password"
                />
              </>
            )}
            {step == 3 && (
              <>
                <p className={classes.infoText}>
                  На Вашу почту отправлен код, введите его чтобы поменять пароль
                </p>
                <AuthenticationCodeInput value={code} onChange={setCode} />
              </>
            )}
            {step < 4 && (
              <Button
                className={classes.button}
                variant="secondary"
                type="submit"
                disabled={isForgotPasswordLoading || isResetPasswordLoading}
              >
                {BUTTON_TEXT_BY_STEP[step]}
              </Button>
            )}
            <p className={classes.authText}>
              <Link to="/auth/login">Войти</Link>
              {step !== 4 && (
                <>
                  {" "}
                  или <Link to="/auth/registration">Зарегистрироваться</Link>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </>
  );
};
