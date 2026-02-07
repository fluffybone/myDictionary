import { Link } from "react-router-dom";
import classes from "../index.module.css";
import { clsx } from "clsx";

export const Login = () => {
  return (
    <>
      <h1>Вход в WordEater 🍥</h1>
      <div className={clsx(classes.authCard, "card")}>
        <div className={clsx(classes.wrapper)}>
          <div>
            <label className="label">Почта</label>
            <input type="text" />
          </div>
          <div>
            <div className={classes.password}>
              <label className="label">Пароль</label>
              <Link to="/auth/forgot-password">Забыли пароль?</Link>
            </div>
            <input type="password" />
          </div>
          <button className={clsx(classes.button, "btn btn-secondary")}>
            Войти
          </button>
          <p className={classes.authText}>
            Нет аккаунта?{" "}
            <Link to="/auth/registration">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </>
  );
};
