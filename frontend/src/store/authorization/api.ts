import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../utils/customBaseQuery";

type TUser = {
  id: number;
  is_active: boolean;
  is_verified: boolean;
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
  }),
  reducerPath: "authorizationApi",
});

export const {
  useCreateAccountMutation,
  useLazyGetAccessCodeQuery,
  useLoginByCodeMutation,
  useRotateAccessCodeMutation,
  useGetMeQuery,
} = authorizationApi;
