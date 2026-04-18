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
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (confirm('Доступна новая версия приложения. Обновить?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};

if (import.meta.env.PROD) {
  registerServiceWorker();
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
