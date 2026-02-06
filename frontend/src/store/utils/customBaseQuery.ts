import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const customBaseQuery = fetchBaseQuery({
  baseUrl: "",
  credentials: "include",
});
