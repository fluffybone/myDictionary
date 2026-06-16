import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/Button";
import { useCreateImprovementSuggestionMutation } from "../../store/authorization/api";
import { getErrorText } from "../../store/utils/getErrorText";
import classes from "./index.module.css";

const MIN_LENGTH = 10;

export const ImprovementSuggestions = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createImprovementSuggestion, { isLoading, error }] =
    useCreateImprovementSuggestionMutation();

  const normalizedLength = message.trim().length;
  const isTooShort = normalizedLength > 0 && normalizedLength < MIN_LENGTH;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < MIN_LENGTH) {
      return;
    }

    const response = await createImprovementSuggestion({
      message: trimmedMessage,
    });

    if ("data" in response && response.data) {
      setMessage("");
      setSuccessMessage("Спасибо. Предложение сохранено, я увижу его на скрытой странице.");
    }
  };

  return (
    <section className={classes.page}>
      <div className={classes.hero}>
        <div>
          <p className={classes.eyebrow}>Обратная связь</p>
          <h1 className={classes.title}>Предложить улучшение для WordEater</h1>
          <p className={classes.description}>
            Напишите, чего вам не хватает, что раздражает или какую идею стоит попробовать дальше.
          </p>
        </div>
        <div className={classes.heroActions}>
          <Button variant="secondary" size="small" onClick={() => navigate(-1)}>
            <ArrowLeftOutlined />
            Назад
          </Button>
        </div>
      </div>

      <form className={classes.card} onSubmit={handleSubmit}>
        <label className={classes.label} htmlFor="improvement-message">
          Что можно улучшить?
        </label>
        <textarea
          id="improvement-message"
          className={classes.textarea}
          name="message"
          placeholder="Например: добавьте избранные слова, быстрый поиск по правилам или напоминания о повторении."
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (successMessage) {
              setSuccessMessage("");
            }
          }}
        />
        <div className={classes.metaRow}>
          <p className={classes.hint}>
            Минимум {MIN_LENGTH} символов. Чем конкретнее идея, тем проще ее реализовать.
          </p>
          <p className={classes.counter}>{normalizedLength} / 2000</p>
        </div>
        {isTooShort && (
          <p className={classes.error}>Пока слишком коротко. Добавьте чуть больше деталей.</p>
        )}
        {!isTooShort && error && (
          <p className={classes.error}>{getErrorText({ error }) || "Не удалось сохранить предложение."}</p>
        )}
        {successMessage && <p className={classes.success}>{successMessage}</p>}
        <div className={classes.actions}>
          <Button type="submit" variant="primary" disabled={isLoading || normalizedLength < MIN_LENGTH}>
            <SendOutlined />
            Отправить предложение
          </Button>
        </div>
      </form>
    </section>
  );
};
