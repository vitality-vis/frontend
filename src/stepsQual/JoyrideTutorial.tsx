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
    content: "Click here to view your saved papers. In the next step, we'll explore the Saved Papers panel.",
    placement: 'bottom',
    // disableBeacon: true,
    disableScrolling: true
  },
  {
    target: "#savedPapersPanel",
    content: "This is the Saved Papers panel. Here you can view all papers you've saved for your research (top table), see AI-generated summaries and prompts (left panel), and write your preliminary literature review notes (right panel).",
    placement: 'bottom',
    disableBeacon: true,
    styles: {
      spotlight: {
        borderRadius: 4
      }
    }
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
  
// Helper function to wait for a DOM element to exist
const waitForTarget = (selector: string, cb: () => void, timeoutMs = 3000) => {
  const start = Date.now();
  const tick = () => {
    if (document.querySelector(selector)) return cb();
    if (Date.now() - start > timeoutMs) {
      console.warn(`Joyride: Target ${selector} not found within ${timeoutMs}ms`);
      return;
    }
    requestAnimationFrame(tick);
  };
  tick();
};

// Helper function to wait for a DOM element to disappear
const waitForTargetToDisappear = (selector: string, cb: () => void, timeoutMs = 3000) => {
  const start = Date.now();
  const tick = () => {
    if (!document.querySelector(selector)) return cb();
    if (Date.now() - start > timeoutMs) {
      console.warn(`Joyride: Target ${selector} still exists after ${timeoutMs}ms`);
      cb(); // proceed anyway
      return;
    }
    requestAnimationFrame(tick);
  };
  tick();
};

// Helper functions for panel state management
const isSavedPapersOpen = () => {
  const isOpen = !!document.querySelector('#savedPapersPanel');
  console.log(`[Joyride] isSavedPapersOpen: ${isOpen}`);
  return isOpen;
};

const openSavedPapers = () => {
  console.log('[Joyride] openSavedPapers() called');
  if (isSavedPapersOpen()) {
    console.log('[Joyride] Panel already open, skipping');
    return;
  }
  console.log('[Joyride] Clicking savedPapersButton to open panel');
  document.getElementById('savedPapersButton')?.click();
};

const closeSavedPapers = () => {
  console.log('[Joyride] closeSavedPapers() called');
  if (!isSavedPapersOpen()) {
    console.log('[Joyride] Panel already closed, skipping');
    return;
  }
  console.log('[Joyride] Clicking close button to close panel');
  const closeButton = document.querySelector('[aria-label="Close"]') as HTMLButtonElement | null;
  closeButton?.click();
};

const JoyrideTutorial = ({currentStep, totalSteps}) => {
  const { goNext } = useStepNav();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  // Time tracking
  const stepStartTimeRef = useRef<number>(0);

  // Ensure panel is open for step 3 (saved papers panel step)
  useEffect(() => {
    if (stepIndex === 3) {
      console.log(`[Joyride] Step ${stepIndex}: Ensuring saved papers panel is open`);
      // Only open if not already open
      if (!isSavedPapersOpen()) {
        console.log('[Joyride] Panel was closed, opening it...');
        openSavedPapers();
      }

      // Scroll target into view to ensure visibility
      const targetId = steps[stepIndex]?.target as string;
      if (targetId) {
        setTimeout(() => {
          const element = document.querySelector(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log(`[Joyride] Scrolled ${targetId} into view`);
          }
        }, 100);
      }
    }
  }, [stepIndex]);

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

    console.log(`[Joyride Callback] type=${type}, action=${action}, index=${index}, status=${status}`);

    // Handle target not found error - only for boundary transitions
    // Don't interfere with normal step transitions (3→4, 4→5, etc.)
    if (type === 'error:target_not_found') {
      console.warn(`[Joyride] ERROR: Target not found for step ${index}, action=${action}, target=${steps[index]?.target}`);

      // Only retry if we're in a boundary transition (opening or closing panel)
      // Boundary forward: index 2→3 (opening panel), index 3→4 (closing panel)
      // Boundary backward: index 3→2 (closing panel), index 4→3 (opening panel)
      const isBoundaryTransition =
        (index === 2 && action === 'next') ||  // Opening panel
        (index === 3 && action === 'next') ||  // Closing panel (going forward)
        (index === 3 && action === 'prev') ||  // Closing panel (going back)
        (index === 4 && action === 'prev');    // Re-opening panel (going back)

      if (isBoundaryTransition) {
        const targetId = steps[index]?.target as string;
        console.log(`[Joyride] Boundary transition detected, waiting for target: ${targetId}`);
        waitForTarget(targetId, () => {
          console.log(`[Joyride] Target found! Retrying step ${index}`);
          setStepIndex(index); // Retry the same step
        });
      } else {
        console.log(`[Joyride] Normal transition error, ignoring (stepIndex will update via state)`);
      }
      return;
    }

    if (type === 'step:after') {
      const endTime = Date.now();
      const duration = (endTime - stepStartTimeRef.current) / 1000; // in seconds

      if (action === 'next') {
        console.log(`[Joyride] NEXT clicked at step ${index} (going to ${index + 1})`);

        // Log time spent on current step when going to next
        Logger.logStudyEvent(
          {
            component: 'joyride',
            action: 'nextButton',
            interactionName: 'timeSpentDuringStep',
            secondsSpent: duration,
            stepContent: steps[index]?.content || 'Unknown step'
          }
        )

        // === FORWARD BOUNDARY TRANSITIONS ===

        // 2 → 3: OPEN Saved Papers panel
        if (index === 2) {
          console.log('[Joyride] Boundary: 2→3, Opening saved papers panel');
          openSavedPapers();
          // Wait for the panel target to exist before advancing
          waitForTarget('#savedPapersPanel', () => {
            console.log('[Joyride] Panel opened, advancing to step 3');
            setStepIndex(3);
            stepStartTimeRef.current = Date.now();
          });
          return;
        }

        // 3 → 4: CLOSE Saved Papers panel
        if (index === 3) {
          console.log('[Joyride] Boundary: 3→4, Closing saved papers panel');
          closeSavedPapers();
          // Wait for panel to disappear, then advance to next step
          waitForTargetToDisappear('#savedPapersPanel', () => {
            console.log('[Joyride] Panel closed, advancing to step 4');
            setStepIndex(4);
            stepStartTimeRef.current = Date.now();
          });
          return;
        }

        // Normal next (no boundary)
        console.log(`[Joyride] Normal next: ${index}→${index + 1}, panel should stay as-is`);
        setStepIndex(index + 1);
        if (index + 1 === steps.length) {
          setTourCompleted(true);
        } else {
          stepStartTimeRef.current = Date.now();
        }
        return;
      }

      if (action === 'prev') {
        console.log(`[Joyride] PREV clicked at step ${index} (going to ${index - 1})`);

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

        // === BACKWARD BOUNDARY TRANSITIONS ===

        // 3 → 2: CLOSE Saved Papers panel when leaving panel step
        if (index === 3) {
          console.log('[Joyride] Boundary: 3→2, Closing saved papers panel');
          closeSavedPapers();
          // Wait until panel is gone, then show step 2 (the button)
          waitForTargetToDisappear('#savedPapersPanel', () => {
            console.log('[Joyride] Panel closed, going back to step 2');
            setStepIndex(2);
            stepStartTimeRef.current = Date.now();
          });
          return;
        }

        // 4 → 3: OPEN Saved Papers panel when going back into panel step
        if (index === 4) {
          console.log('[Joyride] Boundary: 4→3, Opening saved papers panel');
          openSavedPapers();
          // Wait for the panel target to exist before going back
          waitForTarget('#savedPapersPanel', () => {
            console.log('[Joyride] Panel opened, going back to step 3');
            setStepIndex(3);
            stepStartTimeRef.current = Date.now();
          });
          return;
        }

        // Normal prev (no boundary)
        console.log(`[Joyride] Normal prev: ${index}→${index - 1}, panel should stay as-is`);
        setStepIndex(index - 1);
        stepStartTimeRef.current = Date.now();
        return;
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
            zIndex: 1000001,
          },
          overlay: {
            zIndex: 1000001,
          },
          spotlight: {
            zIndex: 1000002,
          },
          tooltip: {
            zIndex: 1000003,
          },
          tooltipContainer: {
            zIndex: 1000003,
          }
        }}
      />}
    <StepLayout
      title= {`Walkthrough (Step ${currentStep}/${totalSteps})`}
      showNext
      showPrev={false}
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
                You've completed the walkthrough!
              </h2>

              <p style={{
                fontSize: '16px',
                color: '#34495e',
                lineHeight: '1.5',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                Feel free to browse around and explore the interface, or click "Next" when you're ready to proceed.
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