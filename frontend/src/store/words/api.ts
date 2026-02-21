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

export const wordsApi = createApi({
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getWords: builder.query<void, void>({
      query: () => ({ url: "/api/words/learning" }),
    }),
    addWord: builder.mutation<TWordResponse, TWord>({
      query: (body) => ({
        url: "/api/words",
        method: "POST",
        body,
      }),
    }),
  }),
  reducerPath: "wordsApi",
});

export const { useGetWordsQuery, useLazyGetWordsQuery, useAddWordMutation } =
  wordsApi;
