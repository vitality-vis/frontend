import * as React from "react";
import { useState } from "react";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";
import { logEvent } from "../socket/logger";
import { Logger } from "../socket/logger";
import { colors, typography, spacing, borderRadius, shadows, components, transitions } from "../styles/studyDesignSystem";

const LiteratureReview = ({currentStep, totalSteps}) => {
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showTask, setShowTask] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShowTask(true);

    Logger.logStudyEvent({
      component: 'LiteratureReview',
      action: 'submit',
      interactionName: 'litReviewExperience',
      response: response
    })
  };

  const canSubmit = response.trim() && !submitted;

  return (
    <StepLayout title= {`Pre-Interview (Step ${currentStep}/${totalSteps})`} showNext showPrev={false} disableNext={!submitted}>
      <div style={{
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100%',
      }}>
      <form
        onSubmit={handleSubmit}
        style={{
          ...components.form.container,
          margin: spacing.sm,
          padding: spacing.md,
          width: '100%',
          maxWidth: 800,
        }}
      >
          <div style={{ marginBottom: spacing.lg }}>
            <label style={components.form.label}>Question</label>
            <div style={{
              ...components.form.description,
              marginBottom: spacing.sm,
            }}>
              Recall a recent topic for which you conducted a literature review. What was the topic?
            </div>

            {/* Instructions and explanation */}
            <div style={{
              backgroundColor: colors.background.subtle,
              padding: spacing.md,
              borderRadius: borderRadius.md,
              marginBottom: spacing.md,
              border: `1px solid ${colors.border.main}`,
              boxShadow: shadows.sm,
            }}>
              <div style={{ fontSize: typography.fontSize.base, marginBottom: spacing.sm, color: colors.neutral.medium }}>
                <strong style={{ color: colors.neutral.dark }}>Why we're asking:</strong> This helps us understand your research background and allows you to practice using VitaLITy with a topic you're familiar with.
              </div>
              <div style={{ fontSize: typography.fontSize.base, marginBottom: spacing.sm, color: colors.neutral.medium }}>
                <strong style={{ color: colors.neutral.dark }}>What to include:</strong> Briefly describe the research topic (1-3 sentences). Include the main subject area and any specific aspects you focused on.
              </div>
              <div style={{ fontSize: typography.fontSize.base, color: colors.neutral.medium }}>
                <strong style={{ color: colors.neutral.dark }}>Example:</strong> "I conducted a literature review on machine learning applications in healthcare diagnostics, specifically focusing on deep learning models for medical image analysis and their clinical validation."
              </div>
            </div>
          </div>

          <div style={{ marginBottom: spacing.lg }}>
            <label style={components.form.label}>Your Response</label>
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Describe your literature review topic here. Include the main subject area and specific aspects you explored..."
              rows={3}
              style={{
                ...components.input.default,
                resize: "vertical",
                minHeight: 60,
                fontFamily: typography.fontFamily.main,
                fontSize: typography.fontSize.base,
                lineHeight: typography.lineHeight.relaxed,
                width: '100%',
                boxSizing: 'border-box',
              }}
              disabled={submitted}
              onFocus={(e) => {
                if (!submitted) {
                  e.target.style.borderColor = colors.border.focus;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.shadow.sm}`;
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.main;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              style={{
                ...components.button.primary,
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.5,
                padding: `${spacing.md} ${spacing['2xl']}`,
                fontSize: typography.fontSize.xl,
              }}
              disabled={!canSubmit}
              onMouseEnter={(e) => {
                if (canSubmit) {
                  (e.target as HTMLButtonElement).style.background = colors.primary.dark;
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLButtonElement).style.boxShadow = shadows.md;
                }
              }}
              onMouseLeave={(e) => {
                if (canSubmit) {
                  (e.target as HTMLButtonElement).style.background = colors.primary.main;
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.target as HTMLButtonElement).style.boxShadow = shadows.sm;
                }
              }}
            >
              {submitted ? "✓ Submitted" : "Submit Response"}
            </button>
            {submitted && (
              <div style={{
                marginTop: spacing.md,
                color: colors.state.success,
                fontWeight: typography.fontWeight.semibold,
                fontSize: typography.fontSize.base,
              }}>
                Great! Read the task below to continue.
              </div>
            )}
          </div>
      </form>

      {/* Task Section */}
      {showTask &&
      <div style={{
        marginTop: spacing.xl,
        padding: spacing.xl,
        maxWidth: 800,
        width: '100%',
        backgroundColor: '#e8f4f8',
        border: `2px solid ${colors.state.info}`,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.md,
      }}>
        <div style={{
          fontWeight: typography.fontWeight.bold,
          fontSize: typography.fontSize['2xl'],
          marginBottom: spacing.md,
          color: colors.neutral.dark,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
        }}>
          📋 Task
        </div>
        <div style={{
          fontSize: typography.fontSize.lg,
          lineHeight: typography.lineHeight.relaxed,
          color: colors.neutral.dark,
        }}>
          In the next step, utilize VitaLITy and act as if you are going to conduct that same literature review again using it. Think aloud as you go.
        </div>
      </div>}
      </div>
    </StepLayout>
  );
};

export default LiteratureReview;