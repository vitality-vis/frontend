// import * as React from "react"
// import { createContext, useContext, useState, ReactNode } from 'react';

// interface StudyContextType {
//   studyId: number;
//   userId: number;
//   currentStep: number;
//   totalSteps: number;
//   goNext: () => void;
//   goPrev: () => void;
//   goToStep: (step: number) => void;
// }

// const StudyContext = createContext<StudyContextType | undefined>(undefined);

// export const useStudy = () => {
//   const context = useContext(StudyContext)
//   if (!context) {
//     throw new Error('useStudy must be used within StudyProvider');
//   }
//   return context;
// };

// interface StudyProviderProps {
//   children: ReactNode;
// }

// export const StudyProvider = ({ children }: StudyProviderProps) => {
//   const [studyId] = useState(0);
//   const [userId] = useState(0);
//   const [currentStep, setCurrentStep] = useState(0);
//   const totalSteps = 5;

//   const goNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
//   const goPrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));
//   const goToStep = (step: number) => setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));

//   return (
//     <StudyContext.Provider value={{
//       studyId,
//       userId,
//       currentStep,
//       totalSteps,
//       goNext,
//       goPrev,
//       goToStep
//     }}>
//       {children}
//     </StudyContext.Provider>
//   );
// };