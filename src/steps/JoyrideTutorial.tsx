import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
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
    placement: 'bottom',
    disableBeacon: true, // Disable the beacon for this step
    disableScrolling: true
  },
  {
    target: "#embeddingDropdownButton",
    content: "Use this dropdown to select different embedding models for document search.",
    placement: 'bottom',
    // disableBeacon: true,
    disableScrolling: true
  },
  {
    target: "#savedPapersButton",
    content: "Click here to view your saved papers.",
    placement: 'bottom',
    // disableBeacon: true,
    disableScrolling: true
  },
  {
    target: "#globalSettingsArea",
    content: "Search for anything, add a column for filtering, or map/add/save all the papers in the corpus.",
    placement: 'bottom',
    disableBeacon: true,
    disableScrolling: true
  },

      {
    target: "#titleSearchBox", 
    content: "Use this search box to filter papers by title.",
    placement: 'bottom',
    disableBeacon: true,
    disableScrolling: true
  },

  {
    target: "#similaritySearchPanel",
    content: "Find papers similar to your selected ones.",
    placement: 'left',
    disableBeacon: true
  },
  {
    target: "#visualizationPanel",
    content: "This is the visualization panel where you can see an interactive scatter plot of all papers and customize how they are colored.",
    placement: 'top',
    disableBeacon: true
  },
  {
    target: "#chatWindowsPanel",
    content: "This is the Chat Windows panel where you can have conversations with AI about your research papers.",
    placement: 'left',
    disableBeacon: true,
    locale: {last: "Finish"}
  }



  // Add more steps as needed
];
  
export default function JoyrideTutorial() {
  const { goNext, goPrev } = useStepNav();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  const handleMetadataLoaded = () => {
    setRun(true)
  }

  const handleJoyrideCallback = useCallback((data: any) => {
    const { action, index, status, type } = data;
    
    if (type === 'step:after') {
      if (action === 'next') {
        setStepIndex(index+1)
        if (index+1 === steps.length) {
          setTourCompleted(true)
        }
      }
      if (action === 'prev') {
        setStepIndex(index-1)
      }
    }
    
    // Handle tour completion or skipping
    if (status === 'finished' || status === 'skipped') {
      setRun(false);
      setStepIndex(0);
      setTourCompleted(true);
    }
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
        hideCloseButton={true}
        // showSkipButton={true}
        callback={handleJoyrideCallback}
        disableOverlayClose={true}
        disableScrolling={false}
        disableCloseOnEsc={true}
        spotlightClicks={false}
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
        {tourCompleted && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#2c3e50',
                marginTop: 0,
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                You have finished the tour.
              </h2>
              
              <p style={{
                fontSize: '16px',
                color: '#34495e',
                lineHeight: '1.5',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                You may browse the interface or click "Next" to proceed.
              </p>
              
              <button 
                onClick={() => setTourCompleted(false)}
                style={{
                  backgroundColor: '#000000ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'block',
                  margin: '0 auto'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
    </StepLayout>
    </>
  );
}

