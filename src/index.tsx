import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudyWizard from "./structure/StudyWizard";
import ErrorBoundary from "./structure/ErrorBoundary";
import { encodeStudyId } from "./utils/studyConfig";
import { setLoggingEnabled } from "./utils/loggingConfig";
import socket from "./socket/initsocket";

// STUDY MODE: Enable logging for research data collection
setLoggingEnabled(true);

// Manually connect socket (since it was created before logging was enabled)
socket.connect();
console.log("🔌 Socket manually connected for study mode");

const App = () => (
  <BrowserRouter basename="/vitality2study">
    <ErrorBoundary>
      <Routes>
        <Route path="/app" element={<StudyWizard />} />
        <Route path="*" element={<Navigate to={`/app?study=${encodeStudyId(1)}&userid=12114&step=0`} replace />} />
      </Routes>
    </ErrorBoundary>
  </BrowserRouter>
);

render(<App />, document.getElementById("root"));