import { Link } from "react-router-dom";
import classes from "../index.module.css";
import { clsx } from "clsx";
import { useState, type ChangeEvent, type FormEvent } from "react";

import {
  useRegistrationMutation,
  useVerifyEmailMutation,
} from "../../../store/authorization/api";
import { PasswordInput } from "../components/PasswordInput";
import { getErrorText } from "../../../store/utils/getErrorText";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "../../../shared";
import { AuthenticationCodeInput } from "../components/AuthenticationCodeInput";
import { Button } from "../../../components/Button";

export const Registration = () => {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(new Array(6).fill(""));
  const [registration, { isLoading: isRegistrationLoading, error }] =
    useRegistrationMutation();
  const [verifyEmail, { isLoading: isVerifyEmailLoading, error: codeError }] =
    useVerifyEmailMutation();

  const [formValues, setFormValues] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hadleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step == 1) {
      if (!formValues.email || !formValues.password) return;
      const response = await registration(formValues);
      if ("data" in response) {
        setStep(2);
      }
    }
    if (step == 2 && code.length > 0 && formValues.email) {
      const response = await verifyEmail({
        code: code.join(""),
        email: formValues.email,
      });
      if ("data" in response && response.data) {
        window.location.href = "/";
        localStorage.setItem(
          ACCESS_TOKEN_LOCALSTORAGE_KEY,
          response.data.access_token,
        );
      }
    }
  };

  let emailError = "";

  if (error && "data" in error) {
    if (
      typeof error.data === "object" &&
      error.data &&
      "detail" in error.data &&
      Array.isArray(error.data.detail)
    ) {
      if ("msg" in error.data.detail[0]) {
        emailError = error.data.detail[0].msg;
      }
    }
  }

  const codeErrorText = getErrorText({ error: codeError }) || "";
  const registrationError = getErrorText({ error }) || "";

  return (
    <>
      <h1>Регистрация в WordEater 🍥</h1>
      <div className={clsx(classes.authCard, "card")}>
        {(emailError || registrationError) && (
          <div className={classes.errorText}>
            {emailError || registrationError}
          </div>
        )}
        <form onSubmit={hadleSubmit}>
          <div className={clsx(classes.wrapper)}>
            {step === 1 && (
              <>
                <div>
                  <label className="label">Почта</label>
                  <input
                    className={emailError && "error"}
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={formValues.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Пароль</label>
                  <PasswordInput
                    onChangeValue={handleChange}
                    id="password"
                    name="password"
                    isRequired
                    value={formValues.password}
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <p className={clsx(classes.authText, classes.back)}>
                  <Link to="/auth/registration" onClick={() => setStep(1)}>
                    ← Назад
                  </Link>
                </p>
                {codeErrorText && (
                  <div className={classes.errorText}>{codeErrorText}</div>
                )}
                <p className={classes.infoText}>
                  На Вашу почту отправлен код, для подтверждения регистрации
                </p>
                <AuthenticationCodeInput value={code} onChange={setCode} />
              </>
            )}
            <Button
              className={classes.button}
              variant="secondary"
              type="submit"
              disabled={isRegistrationLoading || isVerifyEmailLoading}
            >
              {step == 1 ? "Зарегистрироваться" : "Отправить"}
            </Button>
            <p className={classes.authText}>
              Есть аккаунт? <Link to="/auth/login">Войти</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};
