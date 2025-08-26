import StepLayout from "../structure/StepLayout";
import React from 'react';

const Task3 = () => {
    return (
        <StepLayout title = "Task 3 (Step 7/N)" showNext showPrev>
            <div style={{ maxWidth: 700, margin: "40px auto 0 auto" }}>
                <h3>Instructions</h3>
                <p>
                    Based on the papers you have found, spend the next 20 minutes writing a
                    first draft of a literature review on this topic. 
                </p>
                <p>
                    Try to write as if this will go in an academic conference paper. ​
                </p>
                <p>
                    Use a minimum of 5 references and try to write 1-2 paragraphs. ​
                </p>
            </div>
        </StepLayout>
    )
}

export default Task3;