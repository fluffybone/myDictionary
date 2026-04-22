import { useState, type FC } from "react";

import classes from "./index.module.css";
import { clsx } from "clsx";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  SoundOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  useDeleteWordsMutation,
  type TWordResponse,
} from "../../../../store/words/api";
import { Checkbox } from "../../../../components/Checkbox";
import { canUseSpeechSynthesis, speakWord } from "../../../../utils/speech";
import { Pagination } from "../../../../components/Pagination";
import { formatDate } from "../../../../utils/formatDate";
import { Button } from "../../../../components/Button";
import { IconButton } from "../../../../components/IconButton";

type TProps = {
  words: TWordResponse[];
  showSection: "all" | "words";
  setShowSection: (show: "all" | "words") => void;
  setMode: (mode: "show" | "delete" | "edit") => void;
  mode: "show" | "delete" | "edit";
  pagination?: {
    currentPage: number;
    onPageChange: (page: number) => void;
    totalPages: number;
  };
  selectedVoiceURI: string;
  speechLang: string;
  setWordForm: ({
    origWord,
    translateWord,
    description,
  }: {
    origWord: string;
    translateWord: string;
    description: string;
    wordId?: number;
  }) => void;
  setIsInvalidateCacheWord: (isInvalidateCacheWord: boolean) => void;
  isLearning?: boolean;
  totalWords?: number;
};

export const ListWords: FC<TProps> = ({
  words,
  setShowSection,
  showSection,
  setMode,
  setIsInvalidateCacheWord,
  mode,
  pagination,
  selectedVoiceURI,
  speechLang,
  setWordForm,
  isLearning,
  totalWords,
}) => {
  const [selectedIds, setSelectedIds] = useState<TWordResponse["id"][]>([]);
  const [deleteWords, { isLoading: isDeleteLoading }] =
    useDeleteWordsMutation();
  const wordsCount = totalWords ?? words.length;

  return (
    <div className={classes.learningWordsContainer}>
      <div className={classes.controlInfo}>
        <div className={classes.control}>
          {mode !== "show" && (
            <Button
              variant="transparent"
              onClick={() => {
                setShowSection("all");
                setMode("show");
                setSelectedIds([]);
                setWordForm({
                  origWord: "",
                  translateWord: "",
                  description: "",
                  wordId: undefined,
                });
              }}
            >
              <ArrowLeftOutlined />
            </Button>
          )}
          {mode === "show" && (
            <Button
              variant="transparent"
              onClick={() =>
                setShowSection(showSection === "words" ? "all" : "words")
              }
            >
              {showSection === "words" ? <DownOutlined /> : <UpOutlined />}
            </Button>
          )}
          {mode === "show" && (
            <Button
              variant="transparent"
              onClick={() => {
                setMode("edit");
                setShowSection("all");
              }}
            >
              <EditOutlined />
            </Button>
          )}
          {mode === "delete" ? (
            <Button
              variant="primary"
              size="small"
              disabled={selectedIds.length == 0 || isDeleteLoading}
              onClick={async () => {
                const response = await deleteWords({ ids: selectedIds });
                if ("data" in response) {
                  setMode("show");
                  setIsInvalidateCacheWord(true);
                }
              }}
            >
              Удалить выбранные
            </Button>
          ) : (
            <>
              {mode == "show" && (
                <Button
                  variant="transparent"
                  onClick={() => {
                    setMode("delete");
                    setShowSection("words");
                  }}
                >
                  <DeleteOutlined />
                </Button>
              )}
            </>
          )}
        </div>
        <p>
          {isLearning ? `${wordsCount} / 10` : `Всего слов: ${wordsCount}`}
        </p>
      </div>
      <div
        className={clsx(classes.learnWords, {
          [classes.showFull]: showSection === "words",
        })}
      >
        <table>
          <tbody>
            {words.map((word) => (
              <tr
                key={word.id}
                className={classes.tableTr}
                onClick={() =>
                  mode === "edit" &&
                  setWordForm({
                    origWord: word.orig_word,
                    translateWord: word.translate_word,
                    description: word.description,
                    wordId: word.id,
                  })
                }
              >
                <td className={classes.actionTd}>
                  {mode === "show" && (
                    <IconButton
                      className={classes.soundButton}
                      disabled={!canUseSpeechSynthesis()}
                      variant="ghost"
                      size="small"
                      aria-label={`Воспроизвести ${word.orig_word}`}
                      title="Воспроизвести"
                      onClick={(event) => {
                        event.stopPropagation();
                        speakWord(word.orig_word, speechLang, selectedVoiceURI);
                      }}
                    >
                      <SoundOutlined />
                    </IconButton>
                  )}
                  {mode === "delete" && (
                    <Checkbox
                      className={classes.checkbox}
                      checked={selectedIds.includes(word.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, word.id]);
                        } else {
                          setSelectedIds(
                            selectedIds.filter((item) => item !== word.id),
                          );
                        }
                      }}
                    />
                  )}
                  {mode === "edit" && (
                    <Button
                      variant="transparent"
                      onClick={() =>
                        setWordForm({
                          origWord: word.orig_word,
                          translateWord: word.translate_word,
                          description: word.description,
                          wordId: word.id,
                        })
                      }
                    >
                      <CheckOutlined />
                    </Button>
                  )}
                </td>
                <td className={classes.wordTd}>{word.orig_word}</td>
                <td className={classes.wordTd}>{word.translate_word}</td>
                <td className={classes.descriptionTd}>{word.description}</td>
                {!isLearning && (
                  <td className={classes.dateTd}>
                    {formatDate(word.created_at)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <Pagination
          className={classes.pagination}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onChange={(page) => {
            pagination.onPageChange(page);
            setSelectedIds([]);
          }}
        />
      )}
    </div>
  );
};
