import * as React from "react"; 
import { useState } from "react";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";
import { logEvent } from "../socket/logger";
import { Logger } from "../socket/logger";

const Consent = ({currentStep, totalSteps}) => {
  const { goNext } = useStepNav();
  const [checked, setChecked] = useState(false);
  const [optOutVisualImage, setOptOutVisualImage] = useState(false);

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
            Thank you for participating in our research study on literature research using data visualisation and a chat interface.
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
                maxHeight: 450,
                overflowY: "auto",
                textAlign: "left",
                margin: "0 auto",
                padding: 24,
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
                PROJECT TITLE: Chat With your Data - LLM and Vector Database
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>1. The research</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>a) Aims and objectives of the research</div>
                  <div>The aim of this study is to evaluate the effectiveness and usability of VitaLITy 2 system that is designed to support literature research using data visualisation and a chat interface. The goals of the study are to evaluate VitaLITy 2 by comparing it to similar tools including its early version VitaLITy and understand how the new features contribute to user literature research task.</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>b) Funder information</div>
                  <div>N/A</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>c) Governance</div>
                  <div>This research has been approved by the School of Computer Science Research Ethics Committee (CS REC), ethics application ID 20422401.</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>2. Taking part in the research</div>
                <div>Participants will be introduced to the VitaLITy 2 system with some initial training. After that, participants will be asked to complete some literature research task, such as writing a short report on academic publications relevant to a topic. This will be followed by a questionnaire and interview. The user interaction with VitaLITy 2 will be logged and the interview will be recorded and transcribed. Any personal identifiable information will be removed after analysis.</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>3. Risks of participation</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>a) Risks</div>
                  <div>There is a small risk of unauthorised access to study data. No other foreseeable risk is identified.</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>b) Mitigation of risks</div>
                  <div>Please see section 5 for the measures we put in place to mitigate the risk of unauthorised access.</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>4. Purpose of data processing</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>a) Data collected</div>
                  <div>We collect the following categories of data during your participation in the research:</div>
                  <ul style={{ marginTop: 8, paddingLeft: 24 }}>
                    <li>Demographic information such as age group and previous experience of the literature research topic.</li>
                    <li>Interactions with the VitaLITy 2 system such as button click and the outcome of the literature review task such as a summary report.</li>
                    <li>Answers to the questionnaire and interview questions.</li>
                  </ul>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>b) Specific purposes for which the data are processed</div>
                  <div>Data collected during the research that identifies you may be:</div>
                  <ul style={{ marginTop: 8, paddingLeft: 24 }}>
                    <li>Analysed to meet the aims and objectives described in Section 1.</li>
                    <li>Reviewed and discussed in supervision sessions between researchers and their supervisors or in research meetings between members of the research team, including project partners.</li>
                    <li>If audio recordings are collected during the research, these may be transcribed and anonymous quotations of your spoken words may be used in scientific works, including presentations, reports and publications stored in databases and posted online, and in marketing materials that promote the research and its findings.</li>
                    <li>If visual images that identify you are collected during the research, they may be used in scientific works, including presentations, reports and publications stored in databases and posted online, and in marketing materials that promote the research and its findings; you will not be named if visual data is used for these purposes and you may opt out in Section 9b.</li>
                  </ul>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>c) Automated decision-making and profiling</div>
                  <div>N/A</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>d) Legal basis for processing your data</div>
                  <div>We collect personal data under the terms of the University of Nottingham's Royal Charter and in our capacity as a teaching and research body to advance education and learning. We thus process your data on the legal basis that our research is in the public interest, we have legitimate interests and / or that you consent to data processing in freely and voluntarily participating in our research activities.</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>5. Storage and retention of your data</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>a) Data protection measures</div>
                  <div>We put the following organisational and / or technical safeguards in place to protect your data and your identity to the best of our ability:</div>
                  <ul style={{ marginTop: 8, paddingLeft: 24 }}>
                    <li>All data stored digitally will be encrypted and password protected and all physical data will be stored in a secure location.</li>
                    <li>You can only be identified by participant ID. The recorded interviews will be transcribed and the original recording deleted. Any identifying comments will be removed from transcript before analysis.</li>
                  </ul>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>b) Retention period</div>
                  <div>Data protection law allows us to retain personal data for an indefinite period and use it in future for public interest, scientific or historical research purposes or statistical purposes, subject to the implementation of technical and organisational measures that safeguard your data, your legal rights and your freedoms. These safeguards include the storage measures described above to protect your data against unauthorised access, and de-identification (anonymisation or pseudonymisation) of your data wherever possible and practicable. Data that identifies or could identify you will not be made public without your consent.</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>6. Third party recipients, services and data transfers</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>a) Project partners</div>
                  <div>Your data will not be shared with others</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>b) Third-party services</div>
                  <div>N/A</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>c) Data transfers</div>
                  <div>Your data will not be transferred to another country</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>7. Your legal rights</div>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>Data protection rights (Data Protection Act 2018)</div>
                <div>You have the right:</div>
                <ul style={{ marginTop: 8, paddingLeft: 24 }}>
                  <li>To be informed about the collection and use of personal data (as per this document).</li>
                  <li>To access and receive a copy of your personal data, and other supplementary information, on request.</li>
                  <li>To object to and restrict data processing if you think we are not complying with data protection law, and to rectify inaccuracies.</li>
                  <li>To be forgotten, i.e., to have your personal data erased.</li>
                  <li>To data portability and to obtain your data in an accessible and machine-readable format if appropriate, or to transfer your data to another organisation if technically feasible.</li>
                  <li>To complain to about the way we process your personal data to our ethics committee (cs-ethicsadmin@cs.nott.ac.uk), our Data Protection Officer (dpo@nottingham.ac.uk) or the Information Commissioner's Office (https://ico.org.uk/make-a-complaint).</li>
                </ul>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>8. Your ethical rights</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>a) Right to withdraw</div>
                  <div>You have the right to withdraw from the research at any time without explanation. You also have the right to request that your data be deleted if you do withdraw.</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>b) Handling of 'mixed' data</div>
                  <div>If the data is 'mixed' data – i.e., if it involves other people (not including the researchers), e.g., a conversation or video of multi-party interaction – it cannot be deleted unless all parties request it. However, any mixed data involving you will be redacted wherever possible, with the exception of scientific works produced prior to your notification of withdrawal.</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>c) Withdrawal procedure</div>
                  <div>If you wish to withdraw, please notify Kai Xu at kai.xu@nottingham.ac.uk. If you do not receive confirmation of withdrawal from the research, please email cs-ethicsadmin@cs.nott.ac.uk</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>9. Consent to participate</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>I consent to participate in the research and my signature or mark confirms the following:</div>
                  <ul style={{ paddingLeft: 24 }}>
                    <li>I understand the aims and objectives of the research</li>
                    <li>I understand what the research requires me to do</li>
                    <li>I accept the risks of participation</li>
                    <li>I understand what data will be collected and the purposes for which the data will be used</li>
                    <li>I understand safeguards will be put in place to protect my data and my legal rights</li>
                    <li>I understand I will not be identified unless the use of identifiable data has been requested and I consent to it</li>
                    <li>I understand that I can withdraw at any time without explanation</li>
                    <li>I have been able to ask questions about the research, my participation, and my data and my questions have been answered satisfactorily</li>
                    <li>I agree to participate and my participation is voluntary</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 18, display: "inline-flex", alignItems: "center", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => setChecked(e.target.checked)}
                  style={{ width: 24, height: 24, marginRight: 12 }}
                />
                I consent to participate in the research
              </label>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #ddd" }}>
              <label style={{ fontSize: 16, display: "inline-flex", alignItems: "center", color: "#555" }}>
                <input
                  type="checkbox"
                  checked={optOutVisualImage}
                  onChange={e => setOptOutVisualImage(e.target.checked)}
                  style={{ width: 20, height: 20, marginRight: 12 }}
                />
                <span style={{ fontStyle: "italic" }}>
                  (Optional) I do NOT consent to use of my visual image in scientific works or materials that promote the research
                </span>
              </label>
            </div>
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
                    response: 'yes',
                    consentToParticipate: checked,
                    optOutVisualImage: optOutVisualImage
                  }
                );

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