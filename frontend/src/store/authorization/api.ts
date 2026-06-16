import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../utils/customBaseQuery";

type TUser = {
  id: number;
  is_active: boolean;
  is_verified: boolean;
};

export type TUserLastSeenRow = {
  user_id: number;
  last_seen_at: string | null;
  total_words: number;
  en_words: number;
  de_words: number;
  fr_words: number;
  es_words: number;
  it_words: number;
};

export type TUsersLastSeenResponse = {
  total_users: number;
  users: TUserLastSeenRow[];
};

export type TImprovementSuggestion = {
  id: number;
  user_id: number;
  message: string;
  status: string;
  created_at: string;
};

type TTokenResponse = {
  access_token: string;
  token_type: string;
};

type TTokenWithCodeResponse = TTokenResponse & {
  access_code: string;
};

export const authorizationApi = createApi({
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    createAccount: builder.mutation<TTokenWithCodeResponse, void>({
      query: () => ({
        url: "/api/accounts/create",
        method: "POST",
      }),
    }),
    loginByCode: builder.mutation<TTokenResponse, { access_code: string }>({
      query: (body) => ({
        url: "/api/login-by-code",
        method: "POST",
        body,
      }),
    }),
    getAccessCode: builder.query<{ access_code: string }, void>({
      query: () => ({
        url: "/api/users/access-code",
      }),
    }),
    rotateAccessCode: builder.mutation<{ access_code: string }, void>({
      query: () => ({
        url: "/api/users/access-code/rotate",
        method: "POST",
      }),
    }),
    getMe: builder.query<TUser, void>({
      query: () => ({
        url: "/api/users/me",
      }),
    }),
    getUsersLastSeen: builder.query<TUsersLastSeenResponse, void>({
      query: () => ({
        url: "/api/users/last-seen",
      }),
    }),
    createImprovementSuggestion: builder.mutation<
      TImprovementSuggestion,
      { message: string }
    >({
      query: (body) => ({
        url: "/api/improvement-suggestions",
        method: "POST",
        body,
      }),
    }),
    getImprovementSuggestions: builder.query<
      { suggestions: TImprovementSuggestion[] },
      void
    >({
      query: () => ({
        url: "/api/improvement-suggestions",
      }),
    }),
  }),
  reducerPath: "authorizationApi",
});

export const {
  useCreateAccountMutation,
  useLazyGetAccessCodeQuery,
  useLoginByCodeMutation,
  useRotateAccessCodeMutation,
  useGetMeQuery,
  useGetUsersLastSeenQuery,
  useCreateImprovementSuggestionMutation,
  useGetImprovementSuggestionsQuery,
} = authorizationApi;
