import { Link } from "react-router-dom";
import classes from "./index.module.css";
import { clsx } from "clsx";

export const Registration = () => {
  return (
    <>
      <h1>Регистрация в WordEater 🍥</h1>
      <div className={clsx(classes.authCard, "card")}>
        <div className={clsx(classes.wrapper)}>
          <div>
            <label className="label">Почта</label>
            <input type="text" />
          </div>
          <div>
            <label className="label">Пароль</label>
            <input type="password" />
          </div>
          <button className={clsx(classes.button, "btn btn-secondary")}>
            Зарегистрироваться
          </button>
          <p className={classes.text}>
            Есть аккаунт? <Link to="/auth/login">Войти</Link>
          </p>
        </div>
      </div>
    </>
  );
};
