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
import { decodeStudyCode, encodeStudyId } from "../utils/studyConfig";


const studySteps = {
  1: [Consent, PreInterview, Video, Practice, LiteratureReview, Task, PostInterview],
  2: [Consent, PreQuestionnaire, Task1, Task2, Video, JoyrideTutorial, Practice, Task3, Task, PostInterview],
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

  // Decode the obfuscated study code from URL to get actual studyId
  const studyCode = searchParams.get("study");
  const studyId = decodeStudyCode(studyCode);

  console.log('🔍 StudyWizard Debug:', { studyCode, studyId, currentStep, totalSteps, userId });

  // Save studyId to localStorage for logging purposes
  React.useEffect(() => {
    if (studyId) {
      localStorage.setItem('studyId', String(studyId));
    }
  }, [studyId]);

  // Always redirect to ensure URL matches our generated userId and has valid study code
  const urlUserId = searchParams.get("userid");
  if (!searchParams.get("study") || !urlUserId || urlUserId !== userId) {
    const encodedStudy = encodeStudyId(studyId);
    console.log('🔄 Redirecting to:', `/app?study=${encodedStudy}&userid=${userId}&step=${currentStep}`);
    return <Navigate to={`/app?study=${encodedStudy}&userid=${userId}&step=${currentStep}`} replace />;
  }

  //get appropriate steps for this study
  const steps = studySteps[studyId] || studySteps[1]; //fallback to study 1
  console.log('📚 Available steps for study', studyId, ':', steps.length);
  console.log('📚 Step array:', steps.map(s => s.name));

  const StepComponent = steps[currentStep];

  console.log('📍 StudyWizard rendering - studyId:', studyId, 'currentStep:', currentStep, 'totalSteps:', totalSteps);
  console.log('📍 StepComponent at index', currentStep, ':', StepComponent?.name);

  if (!StepComponent) {
    console.error('❌ No StepComponent found for currentStep:', currentStep, 'studyId:', studyId);
  }

  //handle invalid step
  if (!StepComponent) {
    const encodedStudy = encodeStudyId(studyId);
    console.error('⚠️ Invalid step, redirecting to step 0');
    return <Navigate to={`/app?study=${encodedStudy}&userid=${userId}&step=0`} replace />;
  }

  try {
    console.log('✅ Rendering', StepComponent.name, 'with props:', { currentStep, totalSteps });
    return <StepComponent currentStep={currentStep} totalSteps={totalSteps}/>;
  } catch (error) {
    console.error('💥 Error rendering StepComponent:', error);
    throw error; // Let ErrorBoundary catch it
  }
};

export default StudyWizard;