import * as React from "react";
import StepLayout from "../structure/StepLayout"; 
import { useStepNav } from "../hooks/useStepNav";
// import { logEvent } from "../socket/logger";
import { Logger } from "../socket/logger";


const Video = ({currentStep,totalSteps}) => {
  const { goNext } = useStepNav();
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [showHonorCode, setShowHonorCode] = React.useState(false);

  const startTimeRef = React.useRef(null);

  React.useEffect(() => {
    startTimeRef.current = Date.now();
  }, [])
  
  const handleNextClick = () => {
    setShowHonorCode(true);
  };

  const handleConfirm = () => {
    const endTime = Date.now();
    const spentTime = (endTime - startTimeRef.current) / 60000; // in minutes
    Logger.logStudyEvent({
      component: 'Video',
      action: 'confirm',
      interactionName: 'honorCodeConfirmed',
      minutesSpent: spentTime
    })
    setShowHonorCode(false);
    goNext();
  };

  const handleGoBack = () => {
    Logger.logStudyEvent({
      component: 'Video',
      action: 'back',
      interactionName:'honorCodeBackToVideo',
      minutesSpent: (Date.now() - startTimeRef.current) / 60000
    })
    setShowHonorCode(false);
    setIsConfirmed(false);
  };


  return (
    <>
      <StepLayout title={`Tutorial (Step ${currentStep}/${totalSteps})`} showNext showPrev={false} onNext={handleNextClick}> 
        <div style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          <p style={{
            fontSize: '20px',
            margin: 0,
            color: '#34495e',
            textAlign: 'center'
          }}>
            Watch the tutorial video to get to know the system.
          </p>
          
          {/* Video Link Card */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {/* YouTube Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              backgroundColor: '#ff0000',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,0,0,0.3)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#2c3e50',
              margin: '0 0 8px 0'
            }}>
              VitaLITy Tutorial Video
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: '#7f8c8d',
              margin: '0 0 24px 0',
              lineHeight: 1.5
            }}>
              This video will guide you through the main features of VitaLITy,<br/>
              including searching, filtering, and visualizing research papers.
            </p>
            
            <a 
              href="https://www.youtube.com/watch?v=Ngu_TrorL8U"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                Logger.logStudyEvent({
                  component: 'Video',
                  action: 'click',
                  interactionName: 'openTutorialVideo',
                  url: 'https://www.youtube.com/watch?v=Ngu_TrorL8U'
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ff0000',
                color: 'white',
                padding: '14px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(255,0,0,0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#cc0000';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ff0000';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6.5L17.5 12L10 17.5V6.5Z"/>
              </svg>
              Watch on YouTube
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
          
          <p style={{
            fontSize: '14px',
            color: '#7f8c8d',
            margin: 0,
            textAlign: 'center'
          }}>
            After watching the video, click <strong>Next</strong> to proceed.
          </p>
        </div>
      </StepLayout>

      {/* Honor Code Popup */}
      {showHonorCode && (
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
              Honor Code Verification
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#34495e',
              lineHeight: '1.5',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              By proceeding, you confirm that you have watched the entire tutorial video and understand the system requirements.
            </p>

            <div style={{
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <input
                type="checkbox"
                id="honor-code-checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                style={{
                  width: '15px',
                  height: '15px',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="honor-code-checkbox"
                style={{
                  fontSize: '14px',
                  color: '#2c3e50',
                  cursor: 'pointer',
                  userSelect: 'none',
                  // textAlign: 'center'
                }}
              >
                I have completely watched the tutorial video and understand.
              </label>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleGoBack}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#7f8c8d';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#95a5a6';
                }}
              >
                Go Back to Video
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isConfirmed}
                style={{
                  backgroundColor: isConfirmed ? '#dbca34ff' : '#bdc3c7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: isConfirmed ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (isConfirmed) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#b9a829ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isConfirmed) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#dbca34ff';
                  }
                }}
              >
                Confirm & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Video;