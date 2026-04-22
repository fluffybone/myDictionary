import classes from "./index.module.css";
import { Tabs } from "../../components/tabs";
import { Check } from "../check";
import { BookFilled, BulbFilled } from "@ant-design/icons";
import { AllWords } from "../all-words";
import { LearningWords } from "../learning-words";
import { Rules } from "../rules";

export const Dictionary = () => {
  return (
    <Tabs
      tabs={[
        { name: "Сейчас учу", children: <LearningWords /> },
        { name: "Проверить себя", children: <Check /> },
        { name: <BulbFilled className={classes.allwordsIcon} />, children: <Rules /> },
        {
          name: <BookFilled className={classes.allwordsIcon} />,
          children: <AllWords />,
        },
      ]}
      className={classes.containerTabs}
    />
  );
};
