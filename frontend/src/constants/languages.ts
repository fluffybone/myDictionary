export type TLanguageCode = "en" | "de" | "fr" | "es" | "it";

export type TLanguage = {
  code: TLanguageCode;
  label: string;
  nativeLabel: string;
  speechLang: string;
};

export const LANGUAGES: TLanguage[] = [
  {
    code: "en",
    label: "Английский",
    nativeLabel: "English",
    speechLang: "en-US",
  },
  {
    code: "de",
    label: "Немецкий",
    nativeLabel: "Deutsch",
    speechLang: "de-DE",
  },
  {
    code: "fr",
    label: "Французский",
    nativeLabel: "Français",
    speechLang: "fr-FR",
  },
  {
    code: "es",
    label: "Испанский",
    nativeLabel: "Español",
    speechLang: "es-ES",
  },
  {
    code: "it",
    label: "Итальянский",
    nativeLabel: "Italiano",
    speechLang: "it-IT",
  },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];

export const getLanguageByCode = (code: string | null) =>
  LANGUAGES.find((language) => language.code === code) ?? DEFAULT_LANGUAGE;
