import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudyWizard from "./steps/StudyWizard";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/app" element={<StudyWizard />} />
      <Route path="*" element={<Navigate to="/app?studyid=1&userid=12114&step=0" replace />} />
    </Routes>
  </BrowserRouter>
);

render(<App />, document.getElementById("root"));