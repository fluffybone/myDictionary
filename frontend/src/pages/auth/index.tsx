import { useEffect } from "react";
import { Login } from "./Login";
import { useNavigate, useParams } from "react-router-dom";
import classes from "./index.module.css";
import { Registration } from "./Register";
import { ForgotPassword } from "./ForgotPassword";

export const AuthPage = () => {
  const navigate = useNavigate();
  const params = useParams<{
    type?: "login" | "registration" | "forgot-password";
  }>();

  useEffect(() => {
    if (!params.type) {
      navigate("/auth/login");
    }
  }, [navigate, params]);

  return (
    <>
      <div className={classes.container}>
        {params.type === "login" && <Login />}
        {params.type === "registration" && <Registration />}
        {params.type == "forgot-password" && <ForgotPassword />}
        <p className={classes.text}>З.Ы Скушай каждое слово</p>
      </div>
    </>
  );
};
