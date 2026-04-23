import type { FC } from "react";
import { useEffect, useState } from "react";
import classes from "./index.module.css";
import clsx from "clsx";
import { Outlet, useLocation } from "react-router-dom";
import { SpeechSettingsProvider } from "../../hooks/useSpeechSettings";
import { Button } from "../../components/Button";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "../../shared";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type IosNavigator = Navigator & {
  standalone?: boolean;
};

const INSTALL_BANNER_DISMISSED_KEY = "wordeater_install_banner_dismissed";
const TRANSLATE_HINT_DISMISSED_KEY = "wordeater_translate_hint_dismissed";

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

const isIosSafari = () => {
  const userAgent = window.navigator.userAgent;

  return (
    isIos() &&
    /safari/i.test(userAgent) &&
    !/crios|fxios|edgios|opios|mercury/i.test(userAgent)
  );
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as IosNavigator).standalone === true;

export const Layout: FC = () => {
  const location = useLocation();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosInstallHint, setIosInstallHint] = useState<"safari" | "other" | null>(
    null,
  );
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isTranslateHintVisible, setIsTranslateHintVisible] = useState(false);
  const isAuthPage = location.pathname.includes("auth");
  const hasToken = Boolean(localStorage.getItem(ACCESS_TOKEN_LOCALSTORAGE_KEY));
  const canShowAppControls = hasToken && !isAuthPage;
  const isPublicHomePage = location.pathname === "/" && !hasToken;

  useEffect(() => {
    if (isStandalone()) {
      return;
    }

    const isDismissed =
      localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY) === "true";

    if (isDismissed) {
      return;
    }

    if (isIos()) {
      setIosInstallHint(isIosSafari() ? "safari" : "other");
      setIsBannerVisible(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIsBannerVisible(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsBannerVisible(false);
      localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);


  useEffect(() => {
    if (!canShowAppControls) {
      return;
    }

    const isDismissed =
      localStorage.getItem(TRANSLATE_HINT_DISMISSED_KEY) === "true";

    if (!isDismissed) {
      setIsTranslateHintVisible(true);
    }
  }, [canShowAppControls]);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "true");
    }

    setInstallPrompt(null);
    setIsBannerVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "true");
    setIsBannerVisible(false);
  };

  const handleTranslateHintDismiss = () => {
    localStorage.setItem(TRANSLATE_HINT_DISMISSED_KEY, "true");
    setIsTranslateHintVisible(false);
  };

  return (
    <SpeechSettingsProvider>
      <div className={clsx(classes.layout, isPublicHomePage && classes.scrollableLayout)}>
        {isBannerVisible && (
          <aside className={classes.installBanner}>
            <div>
              <p className={classes.installTitle}>WordEater можно открыть как приложение</p>
              <p className={classes.installText}>
                {iosInstallHint === "other" &&
                  "На iPhone установка доступна через Safari: откройте сайт в Safari, нажмите «Поделиться», затем «На экран Домой»."}
                {iosInstallHint === "safari" &&
                  "Нажмите «Поделиться», затем «На экран Домой»."}
                {!iosInstallHint &&
                  "Установите сайт на устройство, чтобы запускать его с рабочего стола."}
              </p>
            </div>
            <div className={classes.installActions}>
              {installPrompt && (
                <Button variant="primary" size="small" onClick={handleInstall}>
                  Установить
                </Button>
              )}
              <Button variant="secondary" size="small" onClick={handleDismiss}>
                Позже
              </Button>
            </div>
          </aside>
        )}
        {canShowAppControls && isTranslateHintVisible && (
          <aside className={classes.translateHint}>
            <p className={classes.translateHintText}>
              Напоминаем: Вы можете выделить любое слово и нажать “Перевести”
              в системном меню браузера или телефона.
            </p>
            <Button variant="primary" size="small" onClick={handleTranslateHintDismiss}>
              Понятно
            </Button>
          </aside>
        )}
        <Outlet />
      </div>
    </SpeechSettingsProvider>
  );
};
