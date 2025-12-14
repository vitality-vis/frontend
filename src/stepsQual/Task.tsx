import * as React from "react";
import { useState } from "react";
import App from "../components/App";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";
import LoadingScreen from "../components/LoadingScreen";

const Task = ({currentStep, totalSteps}) => {
  const { goNext } = useStepNav();
  const appRef = React.useRef<App>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  console.log('📋 Task component rendering, isLoading:', isLoading, 'progress:', loadingProgress);

  const handleMetadataLoaded = () => {
    console.log('✅ Metadata loaded, hiding loading screen');
    setIsLoading(false);
  };

  const handleLoadingProgress = (progress: number) => {
    console.log('📊 Loading progress:', progress);
    setLoadingProgress(progress);
  };

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
      showPrev={false}
      notPractice={false}
      onNext={handleNext}
    >
        {isLoading && (
          <LoadingScreen 
            message="Loading VitaLITy..." 
            subMessage="Preparing the literature review tool"
            progress={loadingProgress}
          />
        )}
        <App 
          ref={appRef} 
          onMetadataLoaded={handleMetadataLoaded}
          onLoadingProgress={handleLoadingProgress}
        />
    </StepLayout>
  );
};

export default Task;