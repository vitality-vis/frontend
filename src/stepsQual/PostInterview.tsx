import * as React from "react";
import { useState, useEffect } from "react";
import StepLayout from "../structure/StepLayout";
import { logEvent } from "../socket/logger";
import { Logger } from "../socket/logger";
import { colors, typography, spacing, borderRadius, shadows, transitions } from "../styles/studyDesignSystem";

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
      showPrev={false}
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
          backgroundColor: colors.background.card,
          borderRadius: borderRadius.lg,
          padding: spacing['2xl'],
          boxShadow: shadows.lg,
          border: `2px solid ${colors.border.main}`,
          textAlign: 'center',
          width: '100%'
        }}>
          <h2 style={{
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.neutral.dark,
            marginTop: 0,
            marginBottom: spacing.lg
          }}>
            Post-Study Questionnaire
          </h2>

          <p style={{
            fontSize: typography.fontSize.lg,
            color: colors.neutral.medium,
            lineHeight: typography.lineHeight.relaxed,
            marginBottom: spacing.xl
          }}>
            Thank you for completing the study tasks! Please fill out a brief questionnaire about your experience.
          </p>

          <button
            onClick={handleOpenForm}
            style={{
              backgroundColor: colors.state.info,
              color: colors.neutral.white,
              border: 'none',
              borderRadius: borderRadius.md,
              padding: `${spacing.md} ${spacing['2xl']}`,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              cursor: 'pointer',
              boxShadow: shadows.md,
              transition: `all ${transitions.normal}`,
              marginBottom: spacing.lg
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2980b9';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = shadows.lg;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = colors.state.info;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = shadows.md;
            }}
          >
            📋 Open Questionnaire
          </button>

          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.neutral.light,
            marginTop: spacing.lg,
            fontStyle: 'italic'
          }}>
            The questionnaire will open in a new window
          </p>
        </div>

        {/* Completion instruction */}
        <div style={{
          marginTop: spacing.xl,
          padding: spacing.lg,
          backgroundColor: '#e3f2fd',
          border: `2px solid ${colors.state.info}`,
          borderRadius: borderRadius.md,
          width: '100%',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: typography.fontSize.base,
            color: '#1565c0',
            margin: 0,
            fontWeight: typography.fontWeight.semibold
          }}>
            After completing the questionnaire, return here and click <strong>"End Study"</strong> to finish.
          </p>
        </div>
      </div>
    </StepLayout>
  );
};

export default PostInterview;
