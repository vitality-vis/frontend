import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App";
import { setLoggingEnabled } from "./utils/loggingConfig";

// Logging is disabled by default
setLoggingEnabled(false);

const VitaLITyApp = () => (
  <BrowserRouter basename="/vitality2">
    <App />
  </BrowserRouter>
);

render(<VitaLITyApp />, document.getElementById("root"));
