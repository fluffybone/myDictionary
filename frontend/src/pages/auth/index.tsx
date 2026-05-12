import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import classes from "./index.module.css";
import { CodeLogin } from "./CodeLogin";

export const AuthPage = () => {
  const navigate = useNavigate();
  const params = useParams<{
    type?: "login" | "registration" | "forgot-password";
  }>();

  useEffect(() => {
    if (!params.type) {
      navigate("/auth/login");
      return;
    }

    if (params.type !== "login") {
      navigate("/", { replace: true });
    }
  }, [navigate, params]);

  return (
    <>
      <div className={classes.container}>
        {params.type === "login" && <CodeLogin />}
        <p className={classes.text}>З.Ы Скушай каждое слово</p>
      </div>
    </>
  );
};
