import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudyWizard from "./structure/StudyWizard";
import { encodeStudyId } from "./utils/studyConfig";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/app" element={<StudyWizard />} />
      <Route path="*" element={<Navigate to={`/app?study=${encodeStudyId(1)}&userid=12114&step=0`} replace />} />
    </Routes>
  </BrowserRouter>
);

render(<App />, document.getElementById("root"));