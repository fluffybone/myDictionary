import { useState, type FC, type ReactNode } from "react";
import classes from "./index.module.css";
import clsx from "clsx";
import { Button } from "../Button";

type TProps = {
  tabs: { name: ReactNode; children: ReactNode }[];
  className?: string;
};

export const Tabs: FC<TProps> = ({ tabs, className }) => {
  const [activeIndexTab, setActiveIndexTab] = useState(0);

  return (
    <div className={clsx(classes.tabs, className)}>
      <div className={classes.tabsNav}>
        {tabs.map((tab, index) => {
          return (
            <Button
              key={index}
              variant="plain"
              className={clsx({
                [classes.activeTab]: activeIndexTab === index,
              })}
              onClick={() => setActiveIndexTab(index)}
            >
              {tab.name}
            </Button>
          );
        })}
      </div>
      <div className={classes.content}>{tabs[activeIndexTab].children}</div>
    </div>
  );
};
