import { useEffect, useState } from "react";
import { Authorization } from "./Authorization";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "./shared";
const token = localStorage.getItem(ACCESS_TOKEN_LOCALSTORAGE_KEY);

export const App = () => {
  const [enWord, setEnWord] = useState("");
  const [ruWord, setRuWord] = useState("");
  const [words, setWords] = useState<
    { english_word: string; russian_word: string }[]
  >([]);
  const [isVisibleAuth, setIsVisibleAuth] = useState(false);

  const writeWord = async () => {
    const response = await fetch(`/api/words`, {
      body: JSON.stringify({
        english_word: enWord,
        russian_word: ruWord,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ?? "",
      },
    }).then((response) => response.json());
    setWords([...words, response]);
    setRuWord("");
    setEnWord("");
  };

  const getWord = async () => {
    await fetch(`/api/words`, {
      headers: { Authorization: token ?? "" },
    })
      .then((response) => {
        console.log("response", response);
        if (response.status === 401) {
          setIsVisibleAuth(true);
        }
        return response.json();
      })
      .then((res) => setWords(res));
  };

  useEffect(() => {
    getWord();
  }, []);

  return (
    <>
      {isVisibleAuth && <Authorization />}
      <div>
        <input
          placeholder="слово на английском"
          value={enWord}
          onChange={(e) => setEnWord(e.target.value)}
        />
        <input
          placeholder="слово на русском"
          value={ruWord}
          onChange={(e) => setRuWord(e.target.value)}
        />
        <button onClick={() => writeWord()}>Записать слово</button>
        <h2>Все слова</h2>
        <table>
          <thead>
            <tr>
              <th>Слово на английском</th>
              <th>Перевод</th>
            </tr>
          </thead>
          <tbody>
            {words.length > 0 &&
              words.map((word) => {
                return (
                  <tr key={word.english_word}>
                    <td>{word.english_word}</td>
                    <td>{word.russian_word}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
};
