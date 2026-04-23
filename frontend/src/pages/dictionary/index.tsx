import classes from "./index.module.css";
import { Tabs } from "../../components/tabs";
import { Check } from "../check";
import { BookFilled, BulbFilled } from "@ant-design/icons";
import { AllWords } from "../all-words";
import { LearningWords } from "../learning-words";
import { Rules } from "../rules";
import { useSpeechSettings } from "../../hooks/useSpeechSettings";
import { Settings } from "../settings/SpeechSettings";

export const Dictionary = () => {
  const { activeLanguage } = useSpeechSettings();

  return (
    <div className={classes.dictionary}>
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
        contentAction={
          <span className={classes.languageBadge}>{activeLanguage.code}</span>
        }
      />
    </div>
  );
};
