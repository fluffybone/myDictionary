import type { FC } from "react";
import { AddWords } from "./components/AddWords";
import classes from "./index.module.css";
import { Tabs } from "../../components/tabs";

type TProps = {
  words: any;
};

export const Dictionary: FC<TProps> = ({ words }) => {
  console.log("words", words);
  return (
    <Tabs
      tabs={[
        { name: "Сейчас учу", children: <AddWords /> },
        { name: "Все слова", children: <div>Все слова</div> },
      ]}
      className={classes.containerTabs}
    />
  );
};
