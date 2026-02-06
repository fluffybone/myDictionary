import { Route, Routes } from "react-router-dom";
import { Layout } from "./features/Layout";
import { AuthPage } from "./pages/auth";

export const AppRoutes = () => {
  // const location = useLocation();
  // const [getAuthorizedUser, { data: authorizedUser, error: authorizedUserError, isError: isAuthorizedUserError }] =
  //   useLazyGetAuthorizedUserQuery();

  // useEffect(() => {
  //   checkAuthorized().then(() => {
  //     getAuthorizedUser();
  //   });
  // }, [getAuthorizedUser]);

  // if (!authorizedUser) {
  //   return null;
  // }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<AuthPage />} path="/auth/:type?" />
      </Route>
    </Routes>
  );
};
