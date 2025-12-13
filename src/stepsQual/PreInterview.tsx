import * as React from "react";
import { useState } from "react";
import StepLayout from "../structure/StepLayout";
import { logEvent } from "../socket/logger";
import { Logger } from "../socket/logger";
import { colors, typography, spacing, borderRadius, shadows, components, transitions } from "../styles/studyDesignSystem";


const PreInterview = ({currentStep, totalSteps}) => {
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Logger.logStudyEvent({
      component: 'PreInterview',
      action: 'submit',
      interactionName: 'preInterviewResponse',
      response: response
    })

    setSubmitted(true);
  };

  const canSubmit = response.trim() && !submitted;

  return (
    <StepLayout title={`Pre-Interview (Step ${currentStep}/${totalSteps})`} showNext showPrev={false} disableNext={!submitted}>
      <div style={{
        padding: spacing.md,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100%',
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            ...components.form.container,
            margin: spacing.sm,
            padding: spacing.md,
            maxWidth: 600,
          }}
        >
          <div style={{ marginBottom: spacing.md }}>
            <label style={components.form.label}>Question</label>
            <div style={{
              ...components.form.description,
              marginBottom: spacing.sm,
            }}>
              Your paper cited <span style={{ fontWeight: typography.fontWeight.bold, color: colors.primary.main }}>vitaLITy</span> 1.0. Can you tell me about the nature of how you knew about and/or used the system?
            </div>
          </div>

          <div style={{ marginBottom: spacing.md }}>
            <label style={components.form.label}>Your Response</label>
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              rows={3}
              placeholder="Type your response here..."
              style={{
                ...components.input.default,
                resize: "vertical",
                minHeight: 60,
                fontFamily: typography.fontFamily.main,
                fontSize: typography.fontSize.base,
                lineHeight: typography.lineHeight.relaxed,
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
                Thank you! Click "Next" to continue.
              </div>
            )}
          </div>
        </form>
      </div>
    </StepLayout>
  );
};

export default PreInterview;
