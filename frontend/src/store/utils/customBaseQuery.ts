import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "../../shared";

export const customBaseQuery = fetchBaseQuery({
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});
