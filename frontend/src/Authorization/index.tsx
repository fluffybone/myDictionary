import { useState } from "react";
import { ACCESS_TOKEN_LOCALSTORAGE_KEY } from "../shared";

export const Authorization = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const registerUser = async () => {
    const response = await fetch(`/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ password, email }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Ошибка регистрации");
    }

    return response.json();
  };

  const loginUser = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Ошибка входа");
      }

      const data = await response.json();
      console.log("data", data);
      if (data.access_token) {
        localStorage.setItem(
          ACCESS_TOKEN_LOCALSTORAGE_KEY,
          `Bearer ${data.access_token}`,
        );
      }
      window.location.reload();
    } catch (error) {
      console.error("Login failed:", error);
      alert(error instanceof Error ? error.message : "Не удалось войти");
    }
  };

  const verificationCode = async () => {
    const response = await fetch(`/api/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });
    console.log("response", response);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Ошибка");
    }

    return response.json();
  };

  return (
    <>
      <div>
        <h2>Войти</h2>
        <input
          placeholder="логин"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="пароль"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={() => loginUser()}>Войти</button>
      </div>
      <div style={{ backgroundColor: "#ecfce6" }}>
        <h2>Зарегистрироваться</h2>
        <input
          placeholder="логин"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="пароль"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={() => registerUser()}>Зарегистрироваться</button>

        <input
          placeholder="Код подтверждения"
          onChange={(e) => {
            if (e.target.value.trim().length > 0) {
              setCode(e.target.value);
            }
          }}
          value={code}
        />

        <button onClick={() => verificationCode()}>Подтвердить</button>
      </div>
    </>
  );
};
