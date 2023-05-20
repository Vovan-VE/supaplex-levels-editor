import { createRoot } from "react-dom/client";
import "./index.scss";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  // StrictMode makes me crazy with that double mounting in React 18
  <App />,
);
