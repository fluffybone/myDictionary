import { useEffect, useState } from "react";
import { DisplayWords } from "../../features/DisplayWords";
import { useSpeechSettings } from "../../hooks/useSpeechSettings";
import { useGetWordsQuery } from "../../store/words/api";
import classes from "./index.module.css";

const PAGE_SIZE = 10;

export const AllWords = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { activeLanguage } = useSpeechSettings();
  const { data: words } = useGetWordsQuery({
    isLearning: false,
    language: activeLanguage.code,
    limit: PAGE_SIZE,
    skip: (currentPage - 1) * PAGE_SIZE,
  });
  const totalPages = words ? Math.ceil(words.total / PAGE_SIZE) : 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeLanguage.code]);

  if (words?.total === 0) {
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
          words={words.items}
          isOpenDefaultWordList
          pagination={{
            currentPage,
            onPageChange: setCurrentPage,
            totalPages,
          }}
          totalWords={words.total}
        />
      )}
    </div>
  );
};
