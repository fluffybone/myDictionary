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

root.render(
  <>
    <ReduxProvider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ReduxProvider>
  </>,
);
