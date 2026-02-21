import type { FC } from "react";
import type { TWordResponse } from "../../../../store/words/api";
import classes from "./index.module.css";

type TProps = {
  words: TWordResponse[];
};

export const ListWords: FC<TProps> = ({ words }) => {
  return (
    <>
      <table>
        <tbody>
          {words.map((word) => (
            <tr key={word.id} className={classes.tableTr}>
              <td className={classes.wordTd}>{word.orig_word}</td>
              <td className={classes.wordTd}>{word.translate_word}</td>
              <td className={classes.descriptionTd}>{word.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
