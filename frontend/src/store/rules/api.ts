import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../utils/customBaseQuery";
import type { TEnglishRuleCategory } from "../../data/englishRules";

export type TEnglishRule = {
  category: TEnglishRuleCategory;
  created_at: string;
  description: string;
  examples: string[];
  id: number;
  is_default: boolean;
  matcher_key: string | null;
  title: string;
  updated_at: string | null;
};

export type TEnglishRulePayload = {
  category: TEnglishRuleCategory;
  description: string;
  examples: string[];
  title: string;
};

export type TEnglishRuleHint = {
  hint: string | null;
};

export const rulesApi = createApi({
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    addRule: builder.mutation<TEnglishRule, TEnglishRulePayload>({
      query: (body) => ({
        url: "/api/rules",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RULES"],
    }),
    deleteRule: builder.mutation<void, { id: TEnglishRule["id"] }>({
      query: ({ id }) => ({
        url: `/api/rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RULES"],
    }),
    getRuleHint: builder.query<TEnglishRuleHint, { word: string }>({
      query: ({ word }) => ({
        url: "/api/rules/hint",
        params: { word },
      }),
    }),
    getRules: builder.query<TEnglishRule[], void>({
      query: () => ({ url: "/api/rules" }),
      providesTags: ["RULES"],
    }),
    updateRule: builder.mutation<
      TEnglishRule,
      TEnglishRulePayload & { id: TEnglishRule["id"] }
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
