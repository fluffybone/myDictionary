import { Route, Routes, useNavigate } from "react-router-dom";
import { Layout } from "./features/Layout";
import { AuthPage } from "./pages/auth";
import { useEffect } from "react";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "./shared";
import { Dictionary } from "./pages/dictionary";
import { useGetMeQuery } from "./store/authorization/api";

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
          <Route element={<Dictionary />} path="/" />
        </Route>
      )}
    </Routes>
  );
};
