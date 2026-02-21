import React from "react";
import clsx from "clsx";
import classes from "./index.module.css";

type CollapseProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function Collapse({
  title,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  disabled = false,
  className,
}: CollapseProps) {
  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const isOpen = isControlled ? !!open : uncontrolledOpen;

  const contentId = React.useId();
  const buttonId = React.useId();

  const toggle = () => {
    if (disabled) return;

    const next = !isOpen;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <section
      className={clsx(
        classes.root,
        isOpen && classes.open,
        disabled && classes.disabled,
        className,
        "card",
      )}
    >
      <h3 className={classes.heading}>
        <button
          id={buttonId}
          type="button"
          className={classes.trigger}
          onClick={toggle}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          <span className={classes.title}>{title}</span>

          <span className={classes.chevron} aria-hidden="true" />
        </button>
      </h3>

      <div
        id={contentId}
        className={classes.panel}
        role="region"
        aria-labelledby={buttonId}
        data-state={isOpen ? "open" : "closed"}
      >
        <div className={classes.panelInner}>
          <div className={classes.content}>{children}</div>
        </div>
      </div>
    </section>
  );
}
