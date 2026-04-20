import { DisplayWords } from "../../features/DisplayWords";
import { useGetWordsQuery } from "../../store/words/api";
import classes from "./index.module.css";

export const AllWords = () => {
  const { data: words } = useGetWordsQuery({ isLearning: false });

  if (words?.length === 0) {
    return (
      <div className={classes.notFound}>
        <h3 className={classes.titleNotFound}>
          У Вас пока нет выученных слов :(
        </h3>
      </div>
    );
  }

  return (
    <div>
      {words && (
        <DisplayWords
          words={words}
          isOpenDefaultWordList
          listPageSize={10}
        />
      )}
    </div>
  );
};
