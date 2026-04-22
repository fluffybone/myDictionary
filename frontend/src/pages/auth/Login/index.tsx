import { Link } from "react-router-dom";
import classes from "../index.module.css";
import { clsx } from "clsx";
import { useLoginMutation } from "../../../store/authorization/api";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { PasswordInput } from "../components/PasswordInput";
import { getErrorText } from "../../../store/utils/getErrorText";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "../../../shared";
import { Button } from "../../../components/Button";

export const Login = () => {
  const [login, { isLoading, error }] = useLoginMutation();
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formValues.email || !formValues.password) return;

    const formData = new FormData();
    formData.append("username", formValues.email);
    formData.append("password", formValues.password);

    const response = await login(formData);
    if ("data" in response && response.data) {
      window.location.href = "/";
      localStorage.setItem(
        ACCESS_TOKEN_LOCALSTORAGE_KEY,
        response.data.access_token,
      );
    }
  };

  const errorText = getErrorText({ error }) || "";

  let error400 = false;

  if (error && "status" in error && error.status === 400) {
    error400 = true;
  }

  return (
    <>
      <h1>Вход в WordEater 🍥</h1>
      <div className={clsx(classes.authCard, "card")}>
        <form className={clsx(classes.wrapper)} onSubmit={handleSubmit}>
          {errorText && <div className={classes.errorText}>{errorText}</div>}
          <div>
            <label className="label">Почта</label>
            <input
              type="text"
              value={formValues.email}
              required
              id="email"
              name="email"
              onChange={handleChange}
              className={errorText && !error400 ? "error" : undefined}
            />
          </div>
          <div>
            <div className={classes.password}>
              <label className="label">Пароль</label>
              <Link to="/auth/forgot-password">Забыли пароль?</Link>
            </div>
            <PasswordInput
              onChangeValue={handleChange}
              id="password"
              name="password"
              isRequired
              value={formValues.password}
            />
          </div>
          <Button
            className={classes.button}
            variant="secondary"
            type="submit"
            disabled={isLoading}
          >
            Войти
          </Button>
          <p className={classes.authText}>
            Нет аккаунта?{" "}
            <Link to="/auth/registration">Зарегистрироваться</Link>
          </p>
        </form>
      </div>
    </>
  );
};
