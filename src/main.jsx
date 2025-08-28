import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import Layout from "./components/Layout";
import HError from "./components/HError";
import Welcome from "./pages/Welcome";
import GamePlay from "./pages/GamePlay";
import "./index.css";

const Root = () => {
  const AppWithRouter = (
    <Layout>
      <Switch>
        <Route path="/" component={Welcome} />
        <Route path="/x/:id" component={GamePlay} />
        <Route>
          <HError error={404} />
        </Route>
      </Switch>
    </Layout>
  );

  if (import.meta.env.DEV) {
    return AppWithRouter;
  }

  return <StrictMode>{AppWithRouter}</StrictMode>;
};

createRoot(document.getElementById("root")).render(<Root />);
