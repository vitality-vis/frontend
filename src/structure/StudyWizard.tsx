import * as React from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import Consent from "../stepsQual/Consent";
import PreInterview from "../stepsQual/PreInterview";
import Video from "../stepsQual/Video";
import Practice from "../stepsQual/Practice";
import LiteratureReview from "../stepsQual/LiteratureReview";
import JoyrideTutorial from "../stepsQual/JoyrideTutorial";

import Task1 from "../stepsQuan/Task1";
import Task2 from "../stepsQuan/Task2";
import Task3 from "../stepsQuan/Task3";
// import QualPostInterview from "../stepsQual/QualPostInterview";
// import QuanPostInterview from "../stepsQuan/QuanPostInterview";

import PreQuestionnaire from "../stepsQuan/PreQuestionnaire";

//define different step flows for different studies
// const studySteps = {
//   1: [Consent, PreInterview, Video, Practice, LiteratureReview, Practice, JoyrideTutorial, QualPostInterview],
//   2: [Consent, PreQuestionnaire, Task1, Task2, Video, JoyrideTutorial, Practice, Task3, Practice, QuanPostInterview],
// };

const studySteps = {
  1: [Consent, PreInterview, Video, Practice, LiteratureReview, Practice, JoyrideTutorial],
  2: [Consent, PreQuestionnaire, Task1, Task2, Video, JoyrideTutorial, Practice, Task3, Practice],
};

const StudyWizard = () => {
  const [searchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get("step") || "0", 10);
  const studyId = searchParams.get("studyid") || "1";      //default to "1" for now
  const userId = searchParams.get("userid") || "12114";    
  
  // If required parameters are missing, redirect with defaults
  if (!searchParams.get("studyid") || !searchParams.get("userid")) {
    return <Navigate to={`/app?studyid=${studyId}&userid=${userId}&step=${currentStep}`} replace />;
  }

  React.useEffect(()=> {
    localStorage.setItem('studyId', studyId)
    localStorage.setItem('userId', userId)

    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', 
        typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : String(Date.now())
      )
    }

  },[studyId, userId])
  
  //get appropriate steps for this study
  const steps = studySteps[parseInt(studyId)] || studySteps[1]; //fallback to study 1
  const StepComponent = steps[currentStep];
  
  //handle invalid step
  if (!StepComponent) {
    return <Navigate to={`/app?studyid=${studyId}&userid=${userId}&step=0`} replace />;
  }
  
  return <StepComponent />;
};

export default StudyWizard;