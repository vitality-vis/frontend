// import * as React from "react";
// import { useStudy } from "../context/StudyContext";
// import Consent from "../steps/Consent";
// import PreInterview from "../steps/PreInterview";
// import Video from "../steps/Video";
// import Practice from "../steps/Practice";
// import LiteratureReview from "../steps/LiteratureReview";
// import GuidedTutorial from "./GuidedTutorial";

// const steps = [Consent, PreInterview, Video, Practice, LiteratureReview];

// const StudyWizard = () => {
//   const { currentStep } = useStudy();
//   const StepComponent = steps[currentStep] ?? (() => <div>Invalid Step!</div>);
  
//   return <StepComponent />;
// };

// export default StudyWizard;


import * as React from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import Consent from "../steps/Consent";
import PreInterview from "../steps/PreInterview";
import Video from "../steps/Video";
import Practice from "../steps/Practice";
import LiteratureReview from "../steps/LiteratureReview";
import JoyrideTutorial from "./JoyrideTutorial";
import Joyride from "react-joyride";

const steps = [Consent, PreInterview, Video, Practice, LiteratureReview, JoyrideTutorial];

const StudyWizard = () => {
  const [searchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get("step") || "0", 10);
  const studyId = searchParams.get("studyid") || "1";      // Default to "1"
  const userId = searchParams.get("userid") || "12114";    // Default to "12114"
  
  // If required parameters are missing, redirect with defaults
  if (!searchParams.get("studyid") || !searchParams.get("userid")) {
    return <Navigate to={`/app?studyid=${studyId}&userid=${userId}&step=${currentStep}`} replace />;
  }
  
  const StepComponent = steps[currentStep];
  
  return <StepComponent />;
};

export default StudyWizard;