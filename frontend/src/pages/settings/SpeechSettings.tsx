import { useState } from "react";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { Select } from "../../components/Select";
import { useSpeechSettings } from "../../hooks/useSpeechSettings";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "../../shared";
import classes from "./SpeechSettings.module.css";

export const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { englishVoices, selectedVoiceURI, setSelectedVoiceURI } =
    useSpeechSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);
    setIsOpen(false);
    navigate("/auth/login", { replace: true });
  };

  return (
    <aside className={classes.settings} aria-label="Настройки приложения">
      <div className={classes.panel} data-open={isOpen}>
        <p className={classes.title}>Настройки произношения</p>
        <div className={classes.translateNotice}>
          <p className={classes.noticeTitle}>Быстрый перевод</p>
          <p className={classes.noticeText}>
            Вы можете выделить любое слово на странице и нажать “Перевести”
            в системном меню браузера или телефона.
          </p>
        </div>
        <Select
          name="voice"
          placeholder="Голос по умолчанию"
          value={selectedVoiceURI}
          onChange={(event) => {
            setSelectedVoiceURI(event.target.value);
            setIsOpen(false);
          }}
          options={englishVoices.map((voice) => ({
            label: `${voice.name} / ${voice.lang}`,
            value: voice.voiceURI,
          }))}
        />
        <button
          className={clsx("btn btn-secondary btn-small", classes.logoutButton)}
          type="button"
          onClick={handleLogout}
        >
          <LogoutOutlined />
          Выйти из аккаунта
        </button>
      </div>
      <button
        className={clsx("btn btn-secondary", classes.button)}
        type="button"
        aria-expanded={isOpen}
        aria-label="Открыть настройки приложения"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <SettingOutlined />
      </button>
    </aside>
  );
};
