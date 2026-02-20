import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../utils/customBaseQuery";

export const wordsApi = createApi({
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getWords: builder.query<void, void>({
      query: () => ({ url: "/api/words" }),
    }),
  }),
  reducerPath: "wordsApi",
});

export const { useGetWordsQuery } = wordsApi;
