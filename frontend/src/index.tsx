import { createRoot } from "react-dom/client";
import "./index.scss";
import { App } from "./App";

const root = document.getElementById("root")!;
createRoot(root).render(
  // StrictMode makes me crazy with that double mounting in React 18
  <App root={root} />,
);
