import * as React from "react"; 
import { useState } from "react";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";
import { logEvent } from "../socket/logger";
import { Logger } from "../socket/logger";

const Consent = ({currentStep, totalSteps}) => {
  const { goNext } = useStepNav();
  const [checked, setChecked] = useState(false);

  React.useEffect(() => {
    Logger.logStudyEvent(
      {
        action: 'studyStart',
        component: 'consent',
        interactionName: 'studyStart',
        response: 'yes'
      })
    }, []);

  return (
    <StepLayout title= {`Consent (Step ${currentStep}/${totalSteps})`} showPrev={false}>
      <div style={{ height: "100%", overflow: "auto" }}>
        {/* Landing Page Section */}
        <div style={{ 
          padding: "48px 32px", 
          textAlign: "center",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          borderBottom: "2px solid #dee2e6"
        }}>
          <div style={{ 
            fontSize: 36, 
            fontWeight: 700, 
            color: "#222", 
            marginBottom: 16 
          }}>
            Welcome to the VitaLITy 2 User Study
          </div>
          <div style={{ 
            fontSize: 20, 
            color: "#555", 
            marginBottom: 32,
            lineHeight: 1.4,
            maxWidth: 800,
            margin: "0 auto 32px auto"
          }}>
            Thank you for registering to participate in our research study on visual data analysis.
          </div>
        </div>

        {/* Consent Section */}
        <div style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 24 }}>
            Read the document and provide consent before starting the study.
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #888",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                width: 700,
                maxWidth: "100%",
                maxHeight: 350,
                overflowY: "auto",
                textAlign: "left",
                margin: "0 auto",
                padding: 24,
                fontSize: 18,
                lineHeight: 1.5,
              }}
            >
              <b>Consent Document For Enrolling Adult Participants In a Research Study</b>
              <br /><br />
              <span style={{ textDecoration: "underline", fontWeight: 500 }}>Project Title</span>: Investigating how users visualize and interact with their analytic provenance during visual data analysis.<br />
              <span style={{ textDecoration: "underline", fontWeight: 500 }}>Principal Investigator</span>: Alex Endert<br />
              <span style={{ textDecoration: "underline", fontWeight: 500 }}>Co-Investigators</span>: Arpit Narechania<br />
              <br />
              You are being asked to be a volunteer in a research study.<br /><br />
              <span style={{ textDecoration: "underline", fontWeight: 500 }}>Purpose</span>: The purpose of this study is to evaluate an interactive user interface for visual data analysis.<br />
              <span style={{ textDecoration: "underline", fontWeight: 500 }}>Exclusion/Inclusion Criteria</span>: You should be 18 years old or older and physically located within the U.S. at the time of this study.<br />
              <span style={{ textDecoration: "underline", fontWeight: 500 }}>Procedures</span>: If you decide to be in this study we will share a unique link/URL pointing to the interface. Your part will involve accessing this link in a web browser, watching an embedded video that demonstrates the interface, and then using the interface to complete a set of tasks.<br /><br />
              (Full document continues...)
            </div>
          </div>
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <label style={{ fontSize: 20, display: "inline-flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                style={{ width: 24, height: 24, marginRight: 12 }}
              />
              I consent
            </label>
          </div>
          <div style={{ marginTop: 32 }}>
            <button
              style={{
                background: checked ? "#FFC700" : "#ccc",
                color: "#222",
                fontWeight: 700,
                fontSize: 20,
                border: "none",
                borderRadius: 4,
                padding: "8px 24px",
                cursor: checked ? "pointer": "not-allowed",
              }}
              disabled={!checked}
              onClick={()=>{
                Logger.logStudyEvent(
                  {
                    action: 'consentGiven',
                    component: 'consent',
                    interactionName: 'consentGiven',
                    response: 'yes'
                  }

                );

                // logEvent('consent_given', {consent: true});
                goNext();
              }}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Consent;