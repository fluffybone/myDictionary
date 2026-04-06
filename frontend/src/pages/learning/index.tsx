import { AddWords } from "./components/AddWords";
import classes from "./index.module.css";
import { Tabs } from "../../components/tabs";
import { Check } from "../check";

export const Dictionary = () => {
  return (
    <Tabs
      tabs={[
        { name: "Сейчас учу", children: <AddWords /> },
        { name: "Проверить себя", children: <Check /> },
      ]}
      className={classes.containerTabs}
    />
  );
};
