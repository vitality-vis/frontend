import * as React from "react";
import { useState } from "react";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";

// Placeholder logging utility
function logSubmit(answer: { studyId: number; userId: number; response: string }) {
  // Replace with real logging or API call 
  console.log("logSubmit", answer);
}

const PreQuestionnaire = () => {
  const { studyId, userId } = useStepNav();
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const { goNext } = useStepNav();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logSubmit({ studyId, userId, response });
    setSubmitted(true);
    setShowTask(true);
  };

  return (
    <StepLayout title="Pre-Questionnaire (Step 1/N)" showNext disableNext={!submitted}>
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
          <div style={{ fontSize: 18, marginBottom: 24 }}>
            Name a topic you are currently interested in or are working on.
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Response</div>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
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

    </StepLayout>
  );
};

export default PreQuestionnaire;