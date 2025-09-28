import * as React from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import Consent from "../stepsQual/Consent";
import PreInterview from "../stepsQual/PreInterview";
import Video from "../stepsQual/Video";
import Practice from "../stepsQual/Practice";
import LiteratureReview from "../stepsQual/LiteratureReview";
import JoyrideTutorial from "../stepsQual/JoyrideTutorial";
import Task from "../stepsQual/Task";
import PostInterview from "../stepsQual/PostInterview";

import Task1 from "../stepsQuan/Task1";
import Task2 from "../stepsQuan/Task2";
import Task3 from "../stepsQuan/Task3";
// import QualPostInterview from "../stepsQual/QualPostInterview";
// import QuanPostInterview from "../stepsQuan/QuanPostInterview";

import PreQuestionnaire from "../stepsQuan/PreQuestionnaire";
import { useStepNav } from "../hooks/useStepNav";


const studySteps = {
  1: [Consent, PreInterview, Video, Practice, LiteratureReview, Task, PostInterview],
  2: [Consent, PreQuestionnaire, Task1, Task2, Video, JoyrideTutorial, Practice, Task3, Practice, PostInterview],
};

const generateUserId = () => {
  const array = new Uint8Array(8);
  window.crypto.getRandomValues(array);
  return Array.from(array, a => a.toString(8).padStart(2,'0')).join('')
}

const StudyWizard = () => {
  const [searchParams] = useSearchParams();
  const { currentStep, totalSteps } = useStepNav();

  const [userId] = React.useState(()=> {
    const localId = localStorage.getItem("userId");
    if (localId) return localId;
    const newId = generateUserId();
    localStorage.setItem("userId", newId);
    return newId;
  })

  // Move useEffect to before any conditional returns
  React.useEffect(()=> {
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', 
        typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : String(Date.now())
      )
    }
  },[])

  // const currentStep = parseInt(searchParams.get("step") || "0", 10);

  const studyId = parseInt(searchParams.get("studyid") || "1");
  
  // Save studyId to localStorage whenever it changes
  React.useEffect(() => {
    if (studyId) {
      localStorage.setItem('studyId', String(studyId));
    }
  }, [studyId]);

  // Always redirect to ensure URL matches our generated userId
  const urlUserId = searchParams.get("userid");
  if (!searchParams.get("studyid") || !urlUserId || urlUserId !== userId) {
    return <Navigate to={`/app?studyid=${studyId}&userid=${userId}&step=${currentStep}`} replace />;
  }
  
  //get appropriate steps for this study
  const steps = studySteps[studyId] || studySteps[1]; //fallback to study 1
  const StepComponent = steps[currentStep];
  
  //handle invalid step
  if (!StepComponent) {
    return <Navigate to={`/app?studyid=${studyId}&userid=${userId}&step=0`} replace />;
  }
  
  return <StepComponent currentStep={currentStep} totalSteps={totalSteps}/>;
};

export default StudyWizard;