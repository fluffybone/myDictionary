import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const getErrorText = ({
  error,
}: {
  error: FetchBaseQueryError | SerializedError | undefined;
}) => {
  if (error && "data" in error) {
    if (
      typeof error.data === "object" &&
      error.data &&
      "detail" in error.data
    ) {
      if (Array.isArray(error.data.detail)) {
        if ("msg" in error.data.detail[0]) {
          return error.data.detail[0].msg;
        }
      } else {
        return error.data.detail as string;
      }
    }
  }
};
