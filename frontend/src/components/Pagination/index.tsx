import clsx from "clsx";
import type { FC } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from "../Button";
import classes from "./index.module.css";

type TProps = {
  className?: string;
  currentPage: number;
  onChange: (page: number) => void;
  totalPages: number;
};

export const Pagination: FC<TProps> = ({
  className,
  currentPage,
  onChange,
  totalPages,
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav className={clsx(classes.pagination, className)} aria-label="Пагинация">
      <Button
        className={classes.button}
        variant="secondary"
        size="small"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        aria-label="Предыдущая страница"
      >
        <LeftOutlined />
      </Button>
      <div className={clsx(classes.page, classes.active)} aria-current="page">
        {currentPage} / {totalPages}
      </div>
      <Button
        className={classes.button}
        variant="secondary"
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        aria-label="Следующая страница"
      >
        <RightOutlined />
      </Button>
    </nav>
  );
};
