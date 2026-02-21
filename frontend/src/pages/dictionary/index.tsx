import { AddWords } from "./components/AddWords";
import classes from "./index.module.css";
import { Tabs } from "../../components/tabs";

export const Dictionary = () => {
  return (
    <Tabs
      tabs={[
        { name: "Сейчас учу", children: <AddWords /> },
        // { name: "Все слова", children: <div>Все слова</div> },
      ]}
      className={classes.containerTabs}
    />
  );
};
