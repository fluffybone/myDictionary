import { useState, type FC, type ReactNode } from "react";
import classes from "./index.module.css";
import clsx from "clsx";

type TProps = {
  tabs: { name: string; children: ReactNode }[];
  className?: string;
};

export const Tabs: FC<TProps> = ({ tabs, className }) => {
  const [activeIndexTab, setActiveIndexTab] = useState(0);

  return (
    <div className={clsx(classes.tabs, className)}>
      <div className={classes.tabsNav}>
        {tabs.map((tab, index) => {
          return (
            <button
              type="button"
              className={clsx("btn", {
                [classes.activeTab]: activeIndexTab === index,
              })}
              onClick={() => setActiveIndexTab(index)}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
      <div className={classes.content}>{tabs[activeIndexTab].children}</div>
    </div>
  );
};
