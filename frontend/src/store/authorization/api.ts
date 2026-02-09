import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../utils/customBaseQuery";

export const authorizationApi = createApi({
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<void, FormData>({
      query: (body) => ({
        url: "/api/login",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }),
    }),
    registration: builder.mutation<void, { email: string; password: string }>({
      query: (body) => ({
        url: "/api/register",
        method: "POST",
        body,
      }),
    }),
    verifyEmail: builder.mutation<void, { code: string; email: string }>({
      query: (body) => ({
        url: "/api/verify-email",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/api/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      void,
      { new_password: string; email: string; code: string }
    >({
      query: (body) => ({
        url: "/api/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
  reducerPath: "authorizationApi",
});

export const {
  useLoginMutation,
  useRegistrationMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authorizationApi;
