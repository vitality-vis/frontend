// import * as React from "react";
// import App from "../components/App";
// import StepLayout from "./StepLayout";

// const Practice = () => {
  
//   return (
//     <StepLayout 
//       title="Practice (Step 3/N)" 
//       showNext 
//       showPrev 
//       notPractice={false}
//     >
//       <div style={{ padding: "0 16px 16px" }}>
//         <App />
//       </div>
//     </StepLayout>
//   );
// };

// export default Practice;



import * as React from "react";
import App from "../components/App";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";

const Practice = () => {
  const { goNext, goPrev } = useStepNav();
  
  return (
    <StepLayout 
      title="Practice (Step 3/N)" 
      showNext 
      showPrev 
      notPractice={false}
    >
        <App />
    </StepLayout>
    
  );
};

export default Practice;