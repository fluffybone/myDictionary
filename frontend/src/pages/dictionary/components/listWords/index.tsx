import { useState, type FC } from "react";
import {
  useDeleteWordsMutation,
  type TWordResponse,
} from "../../../../store/words/api";
import classes from "./index.module.css";
import { Checkbox } from "../../../../components/Checkbox";
import { clsx } from "clsx";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  UpOutlined,
} from "@ant-design/icons";

type TProps = {
  words: TWordResponse[];
  showSection: "all" | "words";
  setShowSection: (show: "all" | "words") => void;
  setMode: (mode: "show" | "delete" | "edit") => void;
  mode: "show" | "delete" | "edit";
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
};

export const ListWords: FC<TProps> = ({
  words,
  setShowSection,
  showSection,
  setMode,
  mode,
  setWordForm,
}) => {
  const [selectedIds, setSelectedIds] = useState<TWordResponse["id"][]>([]);
  const [deleteWords, { data, isLoading: isDeleteLoading }] =
    useDeleteWordsMutation();

  console.log("data", data);

  return (
    <div className={classes.learningWordsContainer}>
      <div className={classes.controlInfo}>
        <div className={classes.control}>
          {mode !== "show" && (
            <button
              className="btn-transparent"
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
            </button>
          )}
          {mode === "show" && (
            <button
              className="btn-transparent"
              onClick={() =>
                setShowSection(showSection === "words" ? "all" : "words")
              }
            >
              {showSection === "words" ? <DownOutlined /> : <UpOutlined />}
            </button>
          )}
          {mode === "show" && (
            <button
              className="btn-transparent"
              onClick={() => {
                setMode("edit");
                setShowSection("all");
              }}
            >
              <EditOutlined />
            </button>
          )}
          {mode === "delete" ? (
            <button
              className="btn btn-primary btn-small"
              disabled={selectedIds.length == 0 || isDeleteLoading}
              onClick={async () => {
                const response = await deleteWords({ ids: selectedIds });
                if ("data" in response) {
                  setMode("show");
                }
              }}
            >
              Удалить выбранные
            </button>
          ) : (
            <>
              {mode == "show" && (
                <button
                  className="btn-transparent"
                  onClick={() => {
                    setMode("delete");
                    setShowSection("words");
                  }}
                >
                  <DeleteOutlined />
                </button>
              )}
            </>
          )}
        </div>
        <p>{words.length} / 10</p>
      </div>
      <div
        className={clsx(classes.learnWords, {
          [classes.showFull]: showSection === "words",
        })}
      >
        <table>
          <tbody>
            {words.map((word) => (
              <tr key={word.id} className={classes.tableTr}>
                <td>
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
                    <button
                      className="btn-transparent"
                      onClick={() =>
                        setWordForm({
                          origWord: word.orig_word,
                          translateWord: word.orig_word,
                          description: word.description,
                          wordId: word.id,
                        })
                      }
                    >
                      <CheckOutlined />
                    </button>
                  )}
                </td>
                <td className={classes.wordTd}>{word.orig_word}</td>
                <td className={classes.wordTd}>{word.translate_word}</td>
                <td className={classes.descriptionTd}>{word.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
