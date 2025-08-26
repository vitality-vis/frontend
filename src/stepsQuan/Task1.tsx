import StepLayout from "../structure/StepLayout";
import React, { useState, useEffect } from 'react';
import SmartTable, { SmartTableProps } from "../components/SmartTable";
import { baseUrl } from "../components/App";

interface Paper {
    ID: string;
    Title: string;
    Authors: string[];
    Source: string;
    Year: number;
    Abstract: string;
    Keywords: string[];
    CitationCounts?: number;
}

const Task1 = () => {


    return (
        <StepLayout title="Task 1 (Step 4/N)" showNext>
            <div>
                hello
            </div>
        </StepLayout>
    );
};

export default Task1;