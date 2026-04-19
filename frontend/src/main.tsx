import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { AppRoutes } from "./AppRoutes";
import { setupStore } from "./store/store";
import "./styles/index";

const rootNode = document.querySelector("#root");
if (rootNode === null) {
  throw new Error("Element #root is not found.");
}
const store = setupStore();
const root = createRoot(rootNode);

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js", {
        updateViaCache: "none",
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
};

if (import.meta.env.PROD) {
  window.addEventListener("load", () => {
    registerServiceWorker();
  });
}

root.render(
  <>
    <ReduxProvider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ReduxProvider>
  </>,
);
