import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const Root = () => {
  if (import.meta.env.DEV) {
    return <App />;
  }

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
};

createRoot(document.getElementById("root")).render(<Root />);