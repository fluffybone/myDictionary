import { useEffect, useState } from "react";

export const App = () => {
  const [enWord, setEnWord] = useState("");
  const [ruWord, setRuWord] = useState("");
  const [words, setWords] = useState<
    { english_word: string; russian_word: string }[]
  >([]);

  const writeWord = async () => {
    const response = await fetch("http://127.0.0.1:8000/words", {
      body: JSON.stringify({
        english_word: enWord,
        russian_word: ruWord,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
    console.log("response", response);
    setWords([...words, response]);
  };

  const getWord = async () => {
    await fetch("http://127.0.0.1:8000/words")
      .then((response) => response.json())
      .then((res) => setWords(res));
  };

  useEffect(() => {
    getWord();
  }, []);

  console.log("enWord", enWord);
  return (
    <>
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
          {words.map((word) => {
            return (
              <tr key={word.english_word}>
                <td>{word.english_word}</td>
                <td>{word.russian_word}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
