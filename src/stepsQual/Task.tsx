import * as React from "react";
import App from "../components/App";
import StepLayout from "../structure/StepLayout";

const Task = ({currentStep, totalSteps}) => {

  return (
    <StepLayout 
      title = {`Task (Step ${currentStep}/${totalSteps})`}
      showNext 
      showPrev 
      notPractice={false}
    >
        <App />
    </StepLayout>
  );
};

export default Task;