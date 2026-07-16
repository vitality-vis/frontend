import * as React from "react";
import { ProgressIndicator } from "@fluentui/react";
import "./../assets/scss/LoadingScreen.scss";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  progress?: number; // 0 to 1
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  subMessage,
  progress = 0
}) => {
  console.log('🔄 LoadingScreen rendering, progress:', progress);
  
  // Calculate percentage for display
  const percentComplete = Math.round(progress * 100);
  
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h2 className="loading-message">{message}</h2>
        {subMessage && <p className="loading-sub-message">{subMessage}</p>}
        <div className="progress-container">
          <ProgressIndicator 
            percentComplete={progress}
            barHeight={8}
            styles={{
              progressBar: {
                backgroundColor: '#0078d4',
              },
              progressTrack: {
                backgroundColor: '#e0e0e0',
              }
            }}
          />
          <p className="progress-text">{percentComplete}%</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
