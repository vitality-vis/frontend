import * as React from 'react';
import { useState, useCallback } from 'react';
import StepLayout from './StepLayout';
import App from '../components/App';
import Joyride,{ Step } from 'react-joyride';
// import { Step } from 'react-joyride';
import { useStepNav } from '../hooks/useStepNav';

//style={{ border: "2px solid #1976d2", borderRadius: 8 }}
const steps: Step[] = [
  {
    target: '#metaTableButton',
    content: 'Click here to open the metadata table for more details.',
    // placement: 'top'
  },
  {
    target: "#embeddingDropdownButton",
    content: "Use this dropdown to select different embedding models for document search.",
  },
  {
    target: "#savedPapersButton",
    content: "Click here to view your saved papers.",
  },
  {
    target: "#globalSettingsArea", //duplicate
    content: "Search for anything, add a column for filtering, or map/add/save all the papers in the corpus.",
  },
  {
    target: "#titleSearchBox", //duplicate
    content: "Use this search box to filter papers by title.",
  },
  {
    target: "#similaritySearchPanel",
    content: "Find papers similar to your selected ones.",
  },
  {
    target: "#visualizationPanel",
    content: "This is the visualization panel where you can see an interactive scatter plot of all papers and customize how they are colored.",
  },
  {
    target: "#chatWindowsPanel",
    content: "This is the Chat Windows panel where you can have conversations with AI about your research papers.",
  }



  // Add more steps as needed
];
  
export default function JoyrideTutorial() {
  const { goNext, goPrev } = useStepNav();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const handleMetadataLoaded = useCallback(() => {
    // Start Joyride after metadata is loaded and DOM is ready
    setRun(true);
  }, []);

  return (
    <>
    {
    <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        styles={{
          options: {
            primaryColor: '#000',
          }
        }}
      />}
    <StepLayout 
      title="Practice (Step 3/N)" 
      showNext 
      showPrev 
      notPractice={false}
    >
        <App onMetadataLoaded={handleMetadataLoaded} />
    </StepLayout>
    </>
  );
}

