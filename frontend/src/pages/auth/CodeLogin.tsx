import { clsx } from "clsx";
import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "../../shared";
import {
  useCreateAccountMutation,
  useLoginByCodeMutation,
} from "../../store/authorization/api";
import { getErrorText } from "../../store/utils/getErrorText";
import classes from "./index.module.css";

export const CodeLogin = () => {
  const [accessCode, setAccessCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [loginByCode, { isLoading, error }] = useLoginByCodeMutation();
  const [createAccount, { isLoading: isCreateLoading, error: createError }] =
    useCreateAccountMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessCode.trim()) {
      return;
    }

    const response = await loginByCode({ access_code: accessCode.trim() });
    if ("data" in response && response.data) {
      localStorage.setItem(
        ACCESS_TOKEN_LOCALSTORAGE_KEY,
        response.data.access_token,
      );
      window.location.href = "/";
    }
  };

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

  if (createdCode) {
    return (
      <>
        <h1>Аккаунт создан 🍥</h1>
        <div className={clsx(classes.authCard, "card")}>
          <div className={classes.wrapper}>
            <p className={classes.infoText}>
              Сохраните персональный код входа. Он понадобится для входа на
              других устройствах и после завершения сессии.
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
              <Button onClick={() => (window.location.href = "/")} variant="primary">
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
      <h1>Вход в ПожирательСлов 🍥</h1>
      <div className={clsx(classes.authCard, "card")}>
        <form className={classes.wrapper} onSubmit={handleSubmit}>
          <p className={classes.infoText}>
            Введите ваш персональный код входа, чтобы открыть аккаунт на этом
            устройстве.
          </p>
          {getErrorText({ error }) && (
            <div className={classes.errorText}>{getErrorText({ error })}</div>
          )}
          <div>
            <label className="label" htmlFor="accessCode">
              Код входа
            </label>
            <textarea
              id="accessCode"
              name="accessCode"
              required
              rows={3}
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Например: WordEater-1A-ABCD-EFGH-IJKL"
            />
          </div>
          <Button
            className={classes.button}
            disabled={isLoading}
            type="submit"
            variant="secondary"
          >
            Войти
          </Button>
          {getErrorText({ error: createError }) && (
            <div className={classes.errorText}>
              {getErrorText({ error: createError })}
            </div>
          )}
          <Button
            disabled={isCreateLoading}
            onClick={handleCreateAccount}
            variant="primary"
          >
            Создать аккаунт
          </Button>
        </form>
      </div>
    </>
  );
};
