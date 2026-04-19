import { Route, Routes, useNavigate } from "react-router-dom";
import { Layout } from "./features/Layout";
import { AuthPage } from "./pages/auth";
import { lazy, Suspense, useEffect } from "react";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "./shared";
import { useGetMeQuery } from "./store/authorization/api";

const Dictionary = lazy(() =>
  import("./pages/dictionary").then((module) => ({
    default: module.Dictionary,
  })),
);

export const AppRoutes = () => {
  const { data: authorizedUser, error } = useGetMeQuery();
  const navigate = useNavigate();
  const token = localStorage.getItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);

  useEffect(() => {
    if ((error && "status" in error && error.status === 401) || !token) {
      navigate("/auth/login");
    }
    if (authorizedUser) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, authorizedUser]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<AuthPage />} path="/auth/:type?" />
      </Route>
      {authorizedUser && (
        <Route element={<Layout />}>
          <Route
            element={
              <Suspense fallback={null}>
                <Dictionary />
              </Suspense>
            }
            path="/"
          />
        </Route>
      )}
    </Routes>
  );
};
