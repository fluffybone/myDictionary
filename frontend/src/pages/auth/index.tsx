import { useEffect } from "react";
import { Login } from "./Login";
import { useNavigate, useParams } from "react-router-dom";
import classes from "./index.module.css";
import { Registration } from "./Register";

export const AuthPage = () => {
  const navigate = useNavigate();
  const params = useParams<{ type?: "login" | "registration" }>();
  console.log("params", params);

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
        <p className={classes.text}>З.Ы Скушай каждое слово</p>
      </div>
    </>
  );
};
