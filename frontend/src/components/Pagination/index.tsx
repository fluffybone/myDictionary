import clsx from "clsx";
import type { FC } from "react";
import { Button } from "../Button";
import classes from "./index.module.css";

type TProps = {
  className?: string;
  currentPage: number;
  onChange: (page: number) => void;
  totalPages: number;
};

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));

  return Array.from({ length: 5 }, (_, index) => start + index);
};

export const Pagination: FC<TProps> = ({
  className,
  currentPage,
  onChange,
  totalPages,
}) => {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className={clsx(classes.pagination, className)} aria-label="Пагинация">
      <Button
        className={classes.button}
        variant="secondary"
        size="small"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        Назад
      </Button>
      <div className={classes.pages}>
        {visiblePages.map((page) => (
          <button
            className={clsx(classes.page, {
              [classes.active]: page === currentPage,
            })}
            type="button"
            key={page}
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      <Button
        className={classes.button}
        variant="secondary"
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        Вперед
      </Button>
    </nav>
  );
};
