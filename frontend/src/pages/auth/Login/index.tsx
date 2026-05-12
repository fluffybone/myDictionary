import { Link } from "react-router-dom";
import classes from "../index.module.css";
import { clsx } from "clsx";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { PasswordInput } from "../components/PasswordInput";
import { Button } from "../../../components/Button";

export const Login = () => {
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
    // Legacy email login is intentionally disabled.
    return;
  };

  const isLoading = false;
  const errorText = "";
  const error400 = false;

  return (
    <>
      <h1>Вход в ПожирательСлов 🍥</h1>
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
