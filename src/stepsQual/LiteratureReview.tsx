import * as React from "react";
import { useState } from "react";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";
import { logEvent } from "../socket/logger";
import { Logger } from "../socket/logger";

// // Placeholder logging utility
// function logSubmit(answer: { studyId: number; userId: number; response: string }) {
//   // Replace with real logging or API call 
//   console.log("logSubmit", answer);
// }

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

  return (
    <StepLayout title= {`Pre-Interview (Step ${currentStep}/${totalSteps})`} showNext showPrev disableNext={!submitted}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#eee",
          border: "2px solid #234",
          margin: 40,
          padding: 0,
          maxWidth: 800,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Google Form / Microsoft Form header */}

        <div style={{ padding: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Question</div>
          <div style={{ fontSize: 18, marginBottom: 12 }}>
            Recall a recent topic for which you conducted a literature review. What was the topic?
          </div>

          {/* Instructions and explanation */}
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: 16,
            borderRadius: 4,
            marginBottom: 16,
            border: "1px solid #dee2e6"
          }}>
            <div style={{ fontSize: 16, marginBottom: 8, color: "#495057" }}>
              <strong>Why we're asking:</strong> This helps us understand your research background and allows you to practice using VitaLITy with a topic you're familiar with.
            </div>
            <div style={{ fontSize: 16, marginBottom: 8, color: "#495057" }}>
              <strong>What to include:</strong> Briefly describe the research topic (1-3 sentences). Include the main subject area and any specific aspects you focused on.
            </div>
            <div style={{ fontSize: 16, color: "#495057" }}>
              <strong>Example:</strong> "I conducted a literature review on machine learning applications in healthcare diagnostics, specifically focusing on deep learning models for medical image analysis and their clinical validation."
            </div>
          </div>

          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Response</div>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Describe your literature review topic here. Include the main subject area and specific aspects you explored..."
            rows={6}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 18,
              padding: 8,
              border: "1.5px solid #444",
              borderRadius: 2,
              resize: "vertical",
              minHeight: 120,
              marginBottom: 32
            }}
            disabled={submitted}
          />
          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              style={{
                background: "#FFC700",
                color: "#222",
                fontWeight: 700,
                fontSize: 22,
                border: "2px solid #444",
                borderRadius: 4,
                padding: "8px 48px",
                cursor: response.trim() && !submitted ? "pointer" : "not-allowed",
                opacity: response.trim() && !submitted ? 1 : 0.6, 
                marginTop: 8,
              }}
              disabled={!response.trim() || submitted}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </form>

      {/* Task Section */}
      {showTask && 
      <div style={{
        margin: "32px",
        marginTop: "16px",
        maxWidth: 750,
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Task</div>
        <div style={{ fontSize: 18, lineHeight: 1.5 }}>
          In the next step, utilize VitaLITy and act as if you are going to conduct that same literature review again using it. Think aloud as you go.
        </div>
      </div>}

    </StepLayout>
  );
};

export default LiteratureReview;