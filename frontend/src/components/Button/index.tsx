import clsx from "clsx";
import type { ButtonHTMLAttributes, FC } from "react";
import classes from "./index.module.css";

type TButtonVariant = "primary" | "secondary" | "transparent" | "plain";
type TButtonSize = "medium" | "small";

type TProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  size?: TButtonSize;
  variant?: TButtonVariant;
};

const getVariantClassName = (variant: TButtonVariant) => {
  if (variant === "transparent") return classes.transparent;
  if (variant === "plain") return classes.plain;

  return classes[variant];
};

export const Button: FC<TProps> = ({
  children,
  className,
  fullWidth,
  size = "medium",
  type = "button",
  variant = "secondary",
  ...props
}) => {
  return (
    <button
      className={clsx(
        classes.button,
        getVariantClassName(variant),
        size === "small" && classes.small,
        fullWidth && classes.fullWidth,
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};
