export type TAppTheme = "warm" | "neo";

const APP_THEME_STORAGE_KEY = "wordeater_theme";

export const getStoredTheme = (): TAppTheme => {
  if (typeof window === "undefined") {
    return "warm";
  }

  return localStorage.getItem(APP_THEME_STORAGE_KEY) === "neo" ? "neo" : "warm";
};

export const applyTheme = (theme: TAppTheme) => {
  if (typeof document === "undefined") {
    return;
  }

  if (theme === "neo") {
    document.documentElement.dataset.theme = "neo";
    return;
  }

  document.documentElement.removeAttribute("data-theme");
};

export const applyStoredTheme = () => {
  applyTheme(getStoredTheme());
};

export const saveTheme = (theme: TAppTheme) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
  }

  applyTheme(theme);
};
