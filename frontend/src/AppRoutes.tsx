import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./features/Layout";
import { AuthPage } from "./pages/auth";
import { lazy, Suspense, useEffect } from "react";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "./shared";
import { useGetMeQuery } from "./store/authorization/api";
import { Home } from "./pages/home";

const Dictionary = lazy(() =>
  import("./pages/dictionary").then((module) => ({
    default: module.Dictionary,
  })),
);

export const AppRoutes = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);
  const { data: authorizedUser, error } = useGetMeQuery(undefined, {
    skip: !token,
  });
  const isCheckingUser = Boolean(token) && !authorizedUser && !error;

  useEffect(() => {
    if (error && "status" in error && error.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);
    }
  }, [error]);

  const dictionaryPage = isCheckingUser ? null : authorizedUser ? (
    <Suspense fallback={null}>
      <Dictionary />
    </Suspense>
  ) : (
    <Home />
  );
  const authPage = isCheckingUser ? null : authorizedUser ? (
    <Navigate to="/" replace />
  ) : (
    <AuthPage />
  );

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={dictionaryPage} path="/" />
        <Route element={authPage} path="/auth/:type?" />
      </Route>
    </Routes>
  );
};
