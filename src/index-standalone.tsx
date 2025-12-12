import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App";
import { setLoggingEnabled } from "./utils/loggingConfig";

// STANDALONE MODE: Disable all logging
setLoggingEnabled(false);

const StandaloneApp = () => (
  <BrowserRouter basename="/vitality2">
    <App />
  </BrowserRouter>
);

render(<StandaloneApp />, document.getElementById("root"));
