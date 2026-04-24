import { useEffect, useRef, useState } from "react";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { LANGUAGES, type TLanguageCode } from "../../constants/languages";
import { useSpeechSettings } from "../../hooks/useSpeechSettings";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "../../shared";
import { authorizationApi } from "../../store/authorization/api";
import { rulesApi } from "../../store/rules/api";
import { useAppDispatch } from "../../store/utils/useAppDispatch";
import { wordsApi } from "../../store/words/api";
import { getStoredTheme, saveTheme, type TAppTheme } from "../../utils/theme";
import classes from "./SpeechSettings.module.css";

export const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<TAppTheme>(() => getStoredTheme());
  const settingsRef = useRef<HTMLElement | null>(null);
  const {
    activeLanguage,
    selectedVoiceURI,
    setActiveLanguageCode,
    setSelectedVoiceURI,
    voices,
  } = useSpeechSettings();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!settingsRef.current) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !settingsRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);
    dispatch(authorizationApi.util.resetApiState());
    dispatch(wordsApi.util.resetApiState());
    dispatch(rulesApi.util.resetApiState());
    setIsOpen(false);
    navigate("/", { replace: true });
    window.location.reload();
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === "neo" ? "warm" : "neo";

    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  return (
    <aside
      ref={settingsRef}
      className={classes.settings}
      aria-label="Настройки приложения"
    >
      <div className={classes.panel} data-open={isOpen}>
        <p className={classes.title}>Дополнительные параметры</p>
        <div className={classes.themeBlock}>
          <div>
            <p className={classes.settingLabel}>Тема</p>
            <p className={classes.settingDescription}>
              Сейчас: {theme}
            </p>
          </div>
          <Button
            variant={theme === "neo" ? "primary" : "secondary"}
            size="small"
            onClick={handleThemeToggle}
          >
            {theme === "neo" ? "warm" : "neo"}
          </Button>
        </div>
        <div className={classes.translateNotice}>
          <p className={classes.noticeTitle}>Быстрый перевод</p>
          <p className={classes.noticeText}>
            Вы можете выделить любое слово на странице и нажать “Перевести”
            в системном меню браузера или телефона.
          </p>
        </div>
        <Select
          className={classes.select}
          name="language"
          label="Язык изучения"
          value={activeLanguage.code}
          onChange={(event) =>
            setActiveLanguageCode(event.target.value as TLanguageCode)
          }
          options={LANGUAGES.map((language) => ({
            label: `${language.label} / ${language.nativeLabel}`,
            value: language.code,
          }))}
        />
        <Select
          className={classes.select}
          name="voice"
          label="Голос озвучки"
          placeholder="Голос по умолчанию"
          value={selectedVoiceURI}
          onChange={(event) => {
            setSelectedVoiceURI(event.target.value);
            setIsOpen(false);
          }}
          options={voices.map((voice) => ({
            label: `${voice.name} / ${voice.lang}`,
            value: voice.voiceURI,
          }))}
        />
        <Button
          className={classes.logoutButton}
          variant="secondary"
          size="small"
          onClick={handleLogout}
        >
          <LogoutOutlined />
          Выйти из аккаунта
        </Button>
      </div>
      <Button
        className={classes.button}
        variant="secondary"
        aria-expanded={isOpen}
        aria-label="Открыть настройки приложения"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <SettingOutlined />
      </Button>
    </aside>
  );
};
