import clsx from "clsx";
import type { ButtonHTMLAttributes, FC, ReactNode } from "react";
import classes from "./index.module.css";

type TIconButtonVariant = "ghost" | "surface" | "danger" | "input";
type TIconButtonSize = "small" | "medium" | "large";

type TProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  size?: TIconButtonSize;
  variant?: TIconButtonVariant;
};

export const IconButton: FC<TProps> = ({
  children,
  className,
  size = "medium",
  type = "button",
  variant = "ghost",
  ...props
}) => {
  return (
    <button
      className={clsx(
        classes.button,
        classes[variant],
        classes[size],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};
