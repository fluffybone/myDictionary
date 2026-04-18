import type { FC } from "react";
import classes from "./index.module.css";
import { Outlet } from "react-router-dom";

export const Layout: FC = () => {
  return (
    <div className={classes.layout}>
      <Outlet />
    </div>
  );
};
