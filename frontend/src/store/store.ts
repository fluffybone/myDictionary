import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authorizationApi } from "./authorization/api";

const rootReducer = combineReducers({
  [authorizationApi.reducerPath]: authorizationApi.reducer,
});

export const setupStore = () => {
  return configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authorizationApi.middleware),
    reducer: rootReducer,
  });
};

export type TAppDispatch = TAppStore["dispatch"];
export type TAppStore = ReturnType<typeof setupStore>;
export type TRootState = ReturnType<typeof rootReducer>;
