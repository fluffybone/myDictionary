import { useState, type FC, type ReactNode } from "react";
import classes from "./index.module.css";
import clsx from "clsx";
import { Button } from "../Button";
import { Settings } from "../../pages/settings/SpeechSettings";

type TProps = {
  tabs: { name: ReactNode; children: ReactNode }[];
  className?: string;
  contentAction?: ReactNode;
};

export const Tabs: FC<TProps> = ({ tabs, className, contentAction }) => {
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
      <div className={classes.content}>
        {contentAction && (
          <div className={classes.contentAction}>{contentAction}</div>
        )}
        {tabs[activeIndexTab].children}<Settings />
      </div>

    </div>
  );
};
