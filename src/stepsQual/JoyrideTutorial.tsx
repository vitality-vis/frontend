// logging: pressing next and back, howmuch time user spent on screen after hitting close


import * as React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import StepLayout from '../structure/StepLayout';
import App from '../components/App';
import Joyride,{ Step } from 'react-joyride';
// import { Step } from 'react-joyride';
import { useStepNav } from '../hooks/useStepNav';
import { logEvent } from '../socket/logger';
import { Logger } from "../socket/logger";



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
  
const JoyrideTutorial = ({currentStep, totalSteps}) => {
  const { goNext } = useStepNav();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);
  
  // Time tracking
  const stepStartTimeRef = useRef<number>(0);

  const handleMetadataLoaded = () => {
    setRun(true);
    // Start timing when tour begins
    stepStartTimeRef.current = Date.now();
  }

  const afterTutorialFinish = useRef<number>(0);

  const handleNextAfterTutorial = () => {
    // Check if user has closed the tutorial and log time spent browsing
    if (afterTutorialFinish.current > 0) {
      const endTime = Date.now();
      const browseDuration = (endTime - afterTutorialFinish.current) / 1000; // in seconds
      
      Logger.logStudyEvent(
        {
          secondsSpent: browseDuration,
          action: 'proceedNextStep',
          component: 'joyride',
          interactionName: 'timeSpentAfterTutorial'
        });
      
      // Reset the timer
      afterTutorialFinish.current = 0;
    }
    
    // Proceed to next step
    goNext();
  };

  const handleJoyrideCallback = useCallback((data: any) => {
    const { action, index, status, type } = data;
    
    if (type === 'step:after') {
      const endTime = Date.now();
      const duration = (endTime - stepStartTimeRef.current) / 1000; // in seconds

      if (action === 'next') {
        // Log time spent on current step when going to next
        // logEvent('joyride_step_timing', {
        //   stepIndex: index,
        //   action: 'next',
        //   secondsSpent: duration,
        //   stepContent: steps[index]?.content || 'Unknown step'
        // });
        Logger.logStudyEvent(
          {
            component: 'joyride',
            action: 'nextButton',
            interactionName: 'timeSpentDuringStep',
            secondsSpent: duration,
            stepContent: steps[index]?.content || 'Unknown step'
          }
        )
        
        setStepIndex(index + 1);
        if (index + 1 === steps.length) {
          setTourCompleted(true);
        } else {
          // Start timing for next step
          stepStartTimeRef.current = Date.now();
        }
      }
      
      if (action === 'prev') {
        // Log time spent on current step when going back
        Logger.logStudyEvent(
          {
            component: 'joyride',
            action: 'prevButton',
            interactionName: 'timeSpentDuringStep',
            secondsSpent: duration,
            stepContent: steps[index]?.content || 'Unknown step'
          }
        )
        
        setStepIndex(index - 1);
        // Start timing for previous step
        stepStartTimeRef.current = Date.now();
      }
    }
    
    // Handle tour completion or skipping
    if (status === 'finished' || status === 'skipped') {
      const endTime = Date.now();
      const duration = (endTime - stepStartTimeRef.current) / 1000; // in seconds

      // logEvent('joyride_tour_completed', {
      //   status: status,
      //   finalStepIndex: stepIndex,
        
      //   action: status === 'finished' ? 'completed' : 'skipped'
      // });
      Logger.logStudyEvent(
          {
            component: 'joyride',
            action: status === 'finished' ? 'completed' : 'skipped',
            interactionName: 'joyrideTourEnd',
            finalStepDuration: duration,
          }
        );
      
      setRun(false);
      setStepIndex(0);
      setTourCompleted(true);
    }
  }, [stepIndex]);

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
      title= {`Walkthrough (Step ${currentStep}/${totalSteps})`} 
      showNext 
      showPrev 
      notPractice={false}
      onNext={handleNextAfterTutorial}
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
                onClick={() => {
                  setTourCompleted(false);
                  afterTutorialFinish.current = Date.now();
                }}
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

export default JoyrideTutorial;