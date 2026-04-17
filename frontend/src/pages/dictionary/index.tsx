import classes from "./index.module.css";
import { Tabs } from "../../components/tabs";
import { Check } from "../check";
import { BookFilled } from "@ant-design/icons";
import { AllWords } from "../all-words";
import { LearningWords } from "../learning-words";

export const Dictionary = () => {
  return (
    <Tabs
      tabs={[
        { name: "Сейчас учу", children: <LearningWords /> },
        { name: "Проверить себя", children: <Check /> },
        {
          name: <BookFilled className={classes.allwordsIcon} />,
          children: <AllWords />,
        },
      ]}
      className={classes.containerTabs}
    />
  );
};
