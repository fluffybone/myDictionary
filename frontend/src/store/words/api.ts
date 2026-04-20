import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../utils/customBaseQuery";

export type TWord = {
  orig_word: string;
  translate_word: string;
  description: string;
};

export type TWordResponse = {
  created_at: string;
  description: string;
  id: number;
  orig_word: string;
  translate_word: string;
};

export type TWordsResponse = {
  items: TWordResponse[];
  total: number;
};

export const wordsApi = createApi({
  baseQuery: customBaseQuery,
  tagTypes: ["LEARNING_WORDS"],
  endpoints: (builder) => ({
    getWords: builder.query<
      TWordsResponse,
      {
        dateFrom?: string;
        dateTo?: string;
        isLearning?: boolean;
        limit?: number;
        random?: boolean;
        skip?: number;
      }
    >({
      query: ({ dateFrom, dateTo, isLearning, limit, random, skip }) => ({
        url: "/api/words/learning",
        params: {
          ...(isLearning == undefined ? {} : { is_learning: isLearning }),
          ...(dateFrom ? { date_from: dateFrom } : {}),
          ...(dateTo ? { date_to: dateTo } : {}),
          ...(limit !== undefined ? { limit } : {}),
          ...(random !== undefined ? { random } : {}),
          ...(skip !== undefined ? { skip } : {}),
        },
      }),
      providesTags: ["LEARNING_WORDS"],
    }),
    addWord: builder.mutation<TWordResponse, TWord>({
      query: (body) => ({
        url: "/api/words",
        method: "POST",
        body,
      }),
    }),
    deleteWords: builder.mutation<void, { ids: TWordResponse["id"][] }>({
      query: ({ ids }) => ({
        url: "/api/words/delete",
        method: "DELETE",
        body: { word_ids: ids },
      }),
      invalidatesTags: ["LEARNING_WORDS"],
    }),
    updateWord: builder.mutation<
      TWordResponse,
      Omit<TWordResponse, "created_at">
    >({
      query: (body) => ({
        url: `/api/words/${body.id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["LEARNING_WORDS"],
    }),
    updateLearningStatusWord: builder.mutation<
      TWordResponse,
      { wordsIds: TWordResponse["id"][] }
    >({
      query: ({ wordsIds }) => ({
        url: `/api/words/learning-status`,
        method: "PATCH",
        body: { word_ids: wordsIds, is_learning: false },
      }),
      invalidatesTags: ["LEARNING_WORDS"],
    }),
  }),
  reducerPath: "wordsApi",
});

export const {
  useGetWordsQuery,
  useDeleteWordsMutation,
  useLazyGetWordsQuery,
  useAddWordMutation,
  useUpdateWordMutation,
  useUpdateLearningStatusWordMutation,
} = wordsApi;
