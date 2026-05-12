import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { useState } from "react";
import { Button } from "../../components/Button";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "../../shared";
import { useCreateAccountMutation } from "../../store/authorization/api";
import { getErrorText } from "../../store/utils/getErrorText";
import classes from "./index.module.css";

export const QuickRegister = () => {
  const [createdCode, setCreatedCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [createAccount, { isLoading, error }] = useCreateAccountMutation();

  const handleCreateAccount = async () => {
    const response = await createAccount();
    if ("data" in response && response.data) {
      localStorage.setItem(
        ACCESS_TOKEN_LOCALSTORAGE_KEY,
        response.data.access_token,
      );
      setCreatedCode(response.data.access_code);
      setIsCopied(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(createdCode);
    setIsCopied(true);
  };

  const handleContinue = () => {
    window.location.href = "/";
  };

  if (createdCode) {
    return (
      <>
        <h1>Аккаунт создан 🍥</h1>
        <div className={clsx(classes.authCard, "card")}>
          <div className={classes.wrapper}>
            <p className={classes.infoText}>
              Сохраните персональный код входа. Он понадобится, чтобы войти на
              другом устройстве или после завершения сессии.
            </p>
            <div className={classes.codePanel}>
              <div className={classes.codeValue}>{createdCode}</div>
            </div>
            <p className={classes.helperText}>
              Не передавайте этот код другим людям.
            </p>
            <div className={classes.inlineActions}>
              <Button onClick={handleCopy} variant="secondary">
                {isCopied ? "Скопировано" : "Скопировать код"}
              </Button>
              <Button onClick={handleContinue} variant="primary">
                Продолжить
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Регистрация в ПожирательСлов 🍥</h1>
      <div className={clsx(classes.authCard, "card")}>
        <div className={classes.wrapper}>
          <p className={classes.infoText}>
            Мы создадим аккаунт сразу, без почты и без анкеты. После этого вы
            получите персональный код входа для других устройств.
          </p>
          {getErrorText({ error }) && (
            <div className={classes.errorText}>{getErrorText({ error })}</div>
          )}
          <Button
            className={classes.button}
            disabled={isLoading}
            onClick={handleCreateAccount}
            variant="secondary"
          >
            Создать аккаунт
          </Button>
          <p className={classes.authText}>
            Уже есть код? <Link to="/auth/login">Войти</Link>
          </p>
        </div>
      </div>
    </>
  );
};
