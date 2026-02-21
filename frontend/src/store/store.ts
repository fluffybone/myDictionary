import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authorizationApi } from "./authorization/api";
import { wordsApi } from "./words/api";

const rootReducer = combineReducers({
  [authorizationApi.reducerPath]: authorizationApi.reducer,
  [wordsApi.reducerPath]: wordsApi.reducer,
});

export const setupStore = () => {
  return configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authorizationApi.middleware,
        wordsApi.middleware,
      ),
    reducer: rootReducer,
  });
};

export type TAppDispatch = TAppStore["dispatch"];
export type TAppStore = ReturnType<typeof setupStore>;
export type TRootState = ReturnType<typeof rootReducer>;
