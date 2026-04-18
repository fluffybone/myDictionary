import type { FC } from "react";
import clsx from "clsx";
import classes from "./index.module.css";
import { Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const INSTALL_BANNER_DISMISSED_KEY = "wordeater_install_banner_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const isMobileDevice = () => {
  const navigatorWithUserAgentData = window.navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
  };

  if (typeof navigatorWithUserAgentData.userAgentData?.mobile === "boolean") {
    return navigatorWithUserAgentData.userAgentData.mobile;
  }

  return /android|iphone|ipad|ipod|mobile/i.test(window.navigator.userAgent);
};

export const Layout: FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY) === "1";
    setIsDismissed(dismissed);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      if (!isMobileDevice()) {
        return;
      }

      const dismissed = localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY) === "1";
      const displayModeStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const iosStandalone = (window.navigator as Navigator & { standalone?: boolean })
        .standalone;
      const isStandaloneNow = displayModeStandalone || Boolean(iosStandalone);

      if (dismissed || isStandaloneNow) {
        return;
      }

      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsDismissed(true);
      localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
    };

    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const isStandalone = useMemo(() => {
    const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean })
      .standalone;
    return displayModeStandalone || Boolean(iosStandalone);
  }, []);

  const showInstallBanner = Boolean(
    deferredPrompt && !isDismissed && !isStandalone && isMobileDevice(),
  );

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
      setIsDismissed(true);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
    setIsDismissed(true);
  };

  return (
    <div className={classes.layout}>
      {showInstallBanner && (
        <section className={classes.installBanner} aria-live="polite">
          <p className={classes.installText}>
            Установите WordEater на телефон для быстрого доступа с домашнего экрана.
          </p>
          <div className={classes.installActions}>
            <button
              className={clsx(
                "btn",
                "btn-secondary",
                "btn-small",
                classes.bannerButton,
              )}
              type="button"
              onClick={handleDismiss}
            >
              Позже
            </button>
            <button
              className={clsx(
                "btn",
                "btn-primary",
                "btn-small",
                classes.bannerButton,
              )}
              type="button"
              onClick={handleInstallClick}
            >
              Установить
            </button>
          </div>
        </section>
      )}
      <Outlet />
    </div>
  );
};
