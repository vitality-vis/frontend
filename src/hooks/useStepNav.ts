import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const useStepNav = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // get current params
  const step = parseInt(searchParams.get("step") || "0", 10);
  const studyId = parseInt(searchParams.get("studyid") || "0", 10);
  const userId = parseInt(searchParams.get("userid") || "0", 10);
  const totalSteps = 6; // hardcoded for simplicity

  // navigation functions
  const goNext = () => {
    if (step < totalSteps - 1) {
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