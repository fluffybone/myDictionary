import type { FC } from "react";
import classes from "./index.module.css";

type TProps = {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
};

export const DateRangeFilter: FC<TProps> = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}) => {
  return (
    <div className={classes.filter}>
      <label className={classes.field}>
        <span>С</span>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(event) => onDateFromChange(event.target.value)}
        />
      </label>
      <label className={classes.field}>
        <span>По</span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(event) => onDateToChange(event.target.value)}
        />
      </label>
    </div>
  );
};
