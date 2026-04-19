import type { FC } from "react";
import { useEffect, useState } from "react";
import classes from "./index.module.css";
import { Outlet } from "react-router-dom";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type IosNavigator = Navigator & {
  standalone?: boolean;
};

const INSTALL_BANNER_DISMISSED_KEY = "wordeater_install_banner_dismissed";

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
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosInstallHint, setIosInstallHint] = useState<"safari" | "other" | null>(
    null,
  );
  const [isBannerVisible, setIsBannerVisible] = useState(false);

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

  return (
    <div className={classes.layout}>
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
              <button className="btn btn-primary btn-small" type="button" onClick={handleInstall}>
                Установить
              </button>
            )}
            <button className="btn btn-secondary btn-small" type="button" onClick={handleDismiss}>
              Позже
            </button>
          </div>
        </aside>
      )}
      <Outlet />
    </div>
  );
};
