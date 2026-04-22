export type TLanguageRuleCategory = "grammar" | "word-building" | "phrases";

export const languageRuleCategories: TLanguageRuleCategory[] = [
  "grammar",
  "word-building",
  "phrases",
];

export const languageRuleCategoryLabels: Record<TLanguageRuleCategory, string> = {
  grammar: "грамматика",
  phrases: "фразы",
  "word-building": "словообразование",
};
