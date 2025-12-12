import * as React from "react";
import { useState, useEffect } from "react";
import StepLayout from "../structure/StepLayout";
import { logEvent } from "../socket/logger";
import { Logger } from "../socket/logger";

const PostInterview = ({currentStep, totalSteps}) => {
  const [showThankYou, setShowThankYou] = useState(false);
  const [formOpened, setFormOpened] = useState(false);

  const handleEndStudy = () => {
    Logger.logStudyEvent({
      component: 'PostInterview',
      action: 'endStudy',
      interactionName: 'postInterviewComplete'
    });
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

  const handleOpenForm = () => {
    setFormOpened(true);
    Logger.logStudyEvent({
      component: 'PostInterview',
      action: 'openForm',
      interactionName: 'postInterviewFormOpened'
    });
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLSdA6nNoHHcbj4cxsdfk-yo58sgOzMXrY1M8mcIfDVRY1B_-pg/viewform',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <StepLayout
      title= {`Post-Interview (Step ${currentStep}/${totalSteps})`}
      showNext={true}
      showPrev
      nextButtonText="End Study"
      onNext={handleEndStudy}
      disableNext={!formOpened}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Main card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e9ecef',
          textAlign: 'center',
          width: '100%'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#2c3e50',
            marginTop: 0,
            marginBottom: '20px'
          }}>
            Post-Study Questionnaire
          </h2>

          <p style={{
            fontSize: '18px',
            color: '#495057',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Thank you for completing the study tasks! Please fill out a brief questionnaire about your experience.
          </p>

          <button
            onClick={handleOpenForm}
            style={{
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(111, 66, 193, 0.3)',
              transition: 'all 0.2s ease',
              marginBottom: '24px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#5a32a3';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(111, 66, 193, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#6f42c1';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(111, 66, 193, 0.3)';
            }}
          >
            Open Questionnaire
          </button>

          <p style={{
            fontSize: '14px',
            color: '#6c757d',
            marginTop: '24px',
            fontStyle: 'italic'
          }}>
            The questionnaire will open in a new window
          </p>
        </div>

        {/* Completion instruction */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#e7f3ff',
          border: '2px solid #0066cc',
          borderRadius: '8px',
          width: '100%',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#004080',
            margin: 0,
            fontWeight: 500
          }}>
            After completing the questionnaire, return here and click <strong>"End Study"</strong> to finish.
          </p>
        </div>
      </div>
    </StepLayout>
  );
};

export default PostInterview;
