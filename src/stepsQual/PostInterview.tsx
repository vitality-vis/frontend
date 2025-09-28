import * as React from "react";
import { useState } from "react";
import StepLayout from "../structure/StepLayout";
import { logEvent } from "../socket/logger";
// import { useStepNav } from "../hooks/useStepNav";
import { Logger } from "../socket/logger";

const PostInterview = ({currentStep, totalSteps}) => {
//   const { studyId, userId } = useStepNav();
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hasClickedExternalForm, setHasClickedExternalForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitted(true);

    Logger.logStudyEvent({
      component: 'PostInterview',
      action: 'submit',
      interactionName: 'postInterviewResponse',
      response: response
    })
  };

  const handleExternalFormClick = () => {
    setHasClickedExternalForm(true);
  };

  const handleEndStudy = () => {
    setShowThankYou(true);
  };

  if (showThankYou) {
    return (
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
            Thank You!
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: '#34495e',
            lineHeight: '1.5',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Thank you for participating in this study. Your responses have been recorded and will help improve our research.
          </p>
  
        </div>
      </div>
    );
  }

  return (
    <StepLayout 
      title= {`Post-Interview (Step ${currentStep}/${totalSteps})`}
      showNext={true} 
      nextButtonText="End Study"
      onNext={handleEndStudy}
      disableNext={!submitted}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#eee",
          border: "2px solid #234",
          margin: 40,
          padding: 32,
          maxWidth: 800,
          marginLeft: "auto",
          marginRight: "auto",
          minHeight: 400
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Question</div>
        <div style={{ fontSize: 18, marginBottom: 24 }}>
          Were you able to find the relevant papers / information you were seeking?
        </div>
        
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Response</div>
        
        <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
          <div 
            onClick={() => !submitted && setResponse("Yes")} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: 18,
              cursor: submitted ? 'not-allowed' : 'pointer'
            }}
          >
            <span style={{
              border: '2px solid #444',
              padding: '8px 16px',
              backgroundColor: response === "Yes" ? '#d4edda' : 'white',
              cursor: submitted ? 'not-allowed' : 'pointer'
            }}>
              Yes
            </span>
          </div>
          
          <div 
            onClick={() => !submitted && setResponse("No")} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: 18,
              cursor: submitted ? 'not-allowed' : 'pointer'
            }}
          >
            <span style={{
              border: '2px solid #444',
              padding: '8px 16px',
              backgroundColor: response === "No" ? '#d4edda' : 'white',
              cursor: submitted ? 'not-allowed' : 'pointer'
            }}>
              No
            </span>
          </div>
        </div>

        <div style={{ 
          fontWeight: 700, 
          fontSize: 20, 
          marginBottom: 16,
          marginTop: 32
        }}>
          Additional questions can be found{' '}
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSdA6nNoHHcbj4cxsdfk-yo58sgOzMXrY1M8mcIfDVRY1B_-pg/viewform?fbzx=8149586167760765042"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleExternalFormClick}
            style={{ 
              color: '#b700ffff',
              textDecoration: 'underline'
            }}
          >
            here
          </a>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button
            type="submit"
            style={{
              background: (response && hasClickedExternalForm && !submitted) ? "#FFC700" : "#ccc",
              color: (response && hasClickedExternalForm && !submitted) ? "#222" : "#666",
              fontWeight: 700,
              fontSize: 22,
              border: "2px solid #444",
              borderRadius: 4,
              padding: "8px 48px",
              cursor: (response && hasClickedExternalForm && !submitted) ? "pointer" : "not-allowed",
              opacity: (response && hasClickedExternalForm && !submitted) ? 1 : 0.6, 
              marginTop: 8,
            }}
            disabled={!response || !hasClickedExternalForm || submitted}
          >
            Submit
          </button>
        </div>
      </form>
    </StepLayout>
  );
};

export default PostInterview;
