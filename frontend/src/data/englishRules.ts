export type TEnglishRuleCategory = "grammar" | "word-building" | "phrases";

export const englishRuleCategories: TEnglishRuleCategory[] = [
  "grammar",
  "word-building",
  "phrases",
];

export const englishRuleCategoryLabels: Record<TEnglishRuleCategory, string> = {
  grammar: "грамматика",
  phrases: "фразы",
  "word-building": "словообразование",
};
