import { createRoot } from "react-dom/client";
import "./index.scss";
import { App } from "./App";
import reportWebVitals from "./reportWebVitals";

createRoot(document.getElementById("root")!).render(
  // StrictMode makes me crazy with that double mounting in React 18
  <App />,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
