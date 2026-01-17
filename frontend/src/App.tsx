import { useState } from "react";

export const App = () => {
  const [hello, setHello] = useState("");
  const fetchHello = async () => {
    const response = await fetch("http://127.0.0.1:8000/hello").then(
      (response) => response.json()
    );
    setHello(response.message);
  };

  return (
    <>
      <h4>{hello}</h4>
      <button onClick={() => fetchHello()}>Поздороваться</button>
    </>
  );
};
