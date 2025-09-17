import StepLayout from "../structure/StepLayout";
import React from "react";

const Task2 = ({currentStep,totalSteps}) => {
    return (
        <StepLayout title={`Task 2 (Step ${currentStep}/${totalSteps})`} showNext>

            <div style={{ maxWidth: 700, margin: "40px auto 0 auto" }}>
                <h3>Instructions</h3>
                <p>
                    Now act as if you are going to conduct the same literature review (that you performed on the previous page) again using the system.
                </p>
                <p>
                    Your job is to use the system to find relevant papers, as if you would be asked to write up a first draft of the literature review afterwards.
                </p>
            </div>
        </StepLayout>
    );
};

export default Task2;