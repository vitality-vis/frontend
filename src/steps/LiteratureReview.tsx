// import * as React from "react";
// import { useState } from "react";
// import StepLayout from "./StepLayout";
// import { useStudy } from "../context/StudyContext";


// // Placeholder logging utility
// function logSubmit(answer: { studyId: number; userId: number; response: string }) {
//   // Replace with real logging or API call 
//   console.log("logSubmit", answer);
// }

// const LiteratureReview = () => {
//   const { studyId, userId } = useStudy();
//   const [response, setResponse] = useState("");
//   const [submitted, setSubmitted] = useState(false);
//   const [showTask, setShowTask] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     logSubmit({ studyId, userId, response });
//     setSubmitted(true);
//     setShowTask(true);
//   };

//   return (
//     <StepLayout title="Pre-Interview (Step 4/N)" showNext disableNext={!submitted}>
//       <form
//         onSubmit={handleSubmit}
//         style={{
//           background: "#eee",
//           border: "2px solid #234",
//           margin: 40,
//           padding: 0,
//           maxWidth: 800,
//           marginLeft: "auto",
//           marginRight: "auto",
//         }}
//       >
//         {/* Google Form / Microsoft Form header */}

//         <div style={{ padding: 32 }}>
//           <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Question</div>
//           <div style={{ fontSize: 18, marginBottom: 24 }}>
//             Recall a recent topic for which you conducted a literature review. What was the topic?
//           </div>
//           <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Response</div>
//           <textarea
//             value={response}
//             onChange={e => setResponse(e.target.value)}
//             rows={6}
//             style={{ 
//               width: "100%", 
//               boxSizing: "border-box", 
//               fontSize: 18, 
//               padding: 8, 
//               border: "1.5px solid #444", 
//               borderRadius: 2, 
//               resize: "vertical", 
//               minHeight: 120, 
//               marginBottom: 32 
//             }}
//             disabled={submitted}
//           />
//           <div style={{ textAlign: "center" }}>
//             <button
//               type="submit"
//               style={{
//                 background: "#FFC700",
//                 color: "#222",
//                 fontWeight: 700,
//                 fontSize: 22,
//                 border: "2px solid #444",
//                 borderRadius: 4,
//                 padding: "8px 48px",
//                 cursor: response.trim() && !submitted ? "pointer" : "not-allowed",
//                 opacity: response.trim() && !submitted ? 1 : 0.6, 
//                 marginTop: 8,
//               }}
//               disabled={!response.trim() || submitted}
//               onClick={handleSubmit}
//             >
//               Submit
//             </button>
//           </div>
//         </div>
//       </form>

//       {/* Task Section */}
//       {showTask && 
//       <div style={{
//         margin: "32px",
//         marginTop: "16px",
//         maxWidth: 750,
//         marginLeft: "auto",
//         marginRight: "auto"
//       }}>
//         <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Task</div>
//         <div style={{ fontSize: 18, lineHeight: 1.5 }}>
//           In the next step, utilize VitaLITy and act as if you are going to conduct that same literature review again using it. Think aloud as you go.
//         </div>
//       </div>}

//     </StepLayout>
//   );
// };

// export default LiteratureReview;





import * as React from "react";
import { useState } from "react";
import StepLayout from "./StepLayout";
import { useStepNav } from "../hooks/useStepNav";

// Placeholder logging utility
function logSubmit(answer: { studyId: number; userId: number; response: string }) {
  // Replace with real logging or API call 
  console.log("logSubmit", answer);
}

const LiteratureReview = () => {
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
    <StepLayout title="Pre-Interview (Step 4/N)" showNext disableNext={!submitted}>
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
            Recall a recent topic for which you conducted a literature review. What was the topic?
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