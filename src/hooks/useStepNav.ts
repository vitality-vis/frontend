import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { decodeStudyCode } from "../utils/studyConfig";

export const useStepNav = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // get current params
  const step = parseInt(searchParams.get("step") || "0", 10);
  const studyCode = searchParams.get("study");
  const studyId = decodeStudyCode(studyCode);
  const userId = searchParams.get("userid") || "";
  
  // total steps per study (max index, not count)
  const studyStepCounts = {
    1: 7, // 8 total steps: indices 0-7 (Consent, PreInterview, Video, JoyrideTutorial, Practice, LiteratureReview, Task, PostInterview)
    2: 9, // 10 total steps: indices 0-9 (Consent, PreQuestionnaire, Task1, Task2, Video, JoyrideTutorial, Practice, Task3, Task, PostInterview)
    // add more studies as needed
  };
  
  const totalSteps = studyStepCounts[studyId] || studyStepCounts[1]; // Fallback to study 1

  // navigation functions
  const goNext = () => {
    if (step < totalSteps) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("step", (step + 1).toString());
      navigate(`/app?${newParams.toString()}`);
    }
  };

  const goPrev = () => {
    if (step > 0) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("step", (step - 1).toString());
      navigate(`/app?${newParams.toString()}`);
    }
  };

  const goToStep = (newStep: number) => {
    const boundedStep = Math.max(0, Math.min(newStep, totalSteps - 1));
    const newParams = new URLSearchParams(searchParams);
    newParams.set("step", boundedStep.toString());
    navigate(`/app?${newParams.toString()}`);
  };

  return {
    studyId,
    userId,
    currentStep: step,
    totalSteps,
    goNext,
    goPrev,
    goToStep,
  };
};