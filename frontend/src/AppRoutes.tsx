import { Route, Routes, useNavigate } from "react-router-dom";
import { Layout } from "./features/Layout";
import { AuthPage } from "./pages/auth";
import { useGetWordsQuery } from "./store/words/api";
import { useEffect } from "react";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "./shared";
import { Dictionary } from "./pages/dictionary";

export const AppRoutes = () => {
  const { data: words, error } = useGetWordsQuery();
  const navigate = useNavigate();

  const token = localStorage.getItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);
  useEffect(() => {
    if ((error && "status" in error && error.status === 401) || !token) {
      navigate("/auth/login");
    }
    if (words || token) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<AuthPage />} path="/auth/:type?" />
      </Route>

      {(words || token) && (
        <Route element={<Layout />}>
          <Route element={<Dictionary />} path="/" />
        </Route>
      )}
    </Routes>
  );
};
