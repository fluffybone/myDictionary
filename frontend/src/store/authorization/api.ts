import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../utils/customBaseQuery";

export const authorizationApi = createApi({
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getAuthorizedUser: builder.query<void, void>({
      query: () => ({ url: "/user/me" }),
    }),
  }),
  reducerPath: "authorizationApi",
});

export const { useGetAuthorizedUserQuery } = authorizationApi;
