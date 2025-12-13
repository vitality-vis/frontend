import * as React from "react";
import { useState } from "react";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";
import { Logger } from "../socket/logger";
import { colors, typography, spacing, borderRadius, shadows, components, transitions } from "../styles/studyDesignSystem";


const PreQuestionnaire = ({currentStep,totalSteps}) => {
  const { studyId, userId } = useStepNav();
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showTask, setShowTask] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Logger.logStudyEvent({
      component: 'PreQuestionnaire',
      action: 'submit',
      interactionName: 'preQuestionnaireResponse',
      response: response
    })
    setSubmitted(true);
    setShowTask(true);
  };

  const canSubmit = response.trim() && !submitted;

  return (
    <StepLayout title={`Pre-Questionnaire (Step ${currentStep}/${totalSteps})`} showNext showPrev={false} disableNext={!submitted}>
      <div style={{
        padding: spacing['2xl'],
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100%',
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            ...components.form.container,
            margin: 0,
          }}
        >
          <div style={{ marginBottom: spacing.xl }}>
            <label style={components.form.label}>Question</label>
            <div style={{
              ...components.form.description,
              marginBottom: spacing.lg,
            }}>
              Name a topic you are currently interested in or are working on.
            </div>
          </div>

          <div style={{ marginBottom: spacing.xl }}>
            <label style={components.form.label}>Your Response</label>
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              rows={6}
              placeholder="e.g., Machine Learning for Healthcare, Climate Change Adaptation, etc."
              style={{
                ...components.input.default,
                resize: "vertical",
                minHeight: 140,
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

export default PreQuestionnaire;
