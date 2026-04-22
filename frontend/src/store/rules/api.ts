import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../utils/customBaseQuery";
import type { TLanguageRuleCategory } from "../../data/languageRules";
import type { TLanguageCode } from "../../constants/languages";

export type TLanguageRule = {
  category: TLanguageRuleCategory;
  created_at: string;
  description: string;
  examples: string[];
  id: number;
  is_default: boolean;
  language: TLanguageCode;
  matcher_key: string | null;
  title: string;
  updated_at: string | null;
};

export type TLanguageRulePayload = {
  category: TLanguageRuleCategory;
  description: string;
  examples: string[];
  language: TLanguageCode;
  title: string;
};

export type TLanguageRuleHint = {
  hint: string | null;
};

export const rulesApi = createApi({
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    addRule: builder.mutation<TLanguageRule, TLanguageRulePayload>({
      query: (body) => ({
        url: "/api/rules",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RULES"],
    }),
    deleteRule: builder.mutation<void, { id: TLanguageRule["id"] }>({
      query: ({ id }) => ({
        url: `/api/rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RULES"],
    }),
    getRuleHint: builder.query<
      TLanguageRuleHint,
      { language: TLanguageCode; word: string }
    >({
      query: ({ language, word }) => ({
        url: "/api/rules/hint",
        params: { language, word },
      }),
    }),
    getRules: builder.query<TLanguageRule[], { language: TLanguageCode }>({
      query: ({ language }) => ({ url: "/api/rules", params: { language } }),
      providesTags: ["RULES"],
    }),
    updateRule: builder.mutation<
      TLanguageRule,
      TLanguageRulePayload & { id: TLanguageRule["id"] }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/rules/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["RULES"],
    }),
  }),
  reducerPath: "rulesApi",
  tagTypes: ["RULES"],
});

export const {
  useAddRuleMutation,
  useDeleteRuleMutation,
  useGetRuleHintQuery,
  useGetRulesQuery,
  useLazyGetRuleHintQuery,
  useUpdateRuleMutation,
} = rulesApi;
