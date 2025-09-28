import * as React from "react";
import App from "../components/App";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";

const Task = ({currentStep, totalSteps}) => {
  const { goNext } = useStepNav();
  const appRef = React.useRef<App>(null);

  const handleNext = () => {
    // Log the Quill content before navigating
    if (appRef.current) {
      appRef.current.logQuillContent();
    }
    // Then navigate to next step
    goNext();
  };

  return (
    <StepLayout 
      title = {`Task (Step ${currentStep}/${totalSteps})`}
      showNext 
      showPrev 
      notPractice={false}
      onNext={handleNext}
    >
        <App ref={appRef} />
    </StepLayout>
  );
};

export default Task;