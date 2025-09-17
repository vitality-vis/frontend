import * as React from "react";
import logo from "../assets/img/vitality-logo-2.png";
import { useStepNav } from "../hooks/useStepNav";

export type StepLayoutProps = {
  title: string;
  showNext?: boolean;
  showPrev?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  disableNext?: boolean;
  notPractice?: boolean;
  nextButtonText?: string;
  children: React.ReactNode;
};

const StepLayout = ({
  title,
  showNext = false,
  showPrev = false,
  disableNext = false,
  notPractice = true,
  nextButtonText = "Next",
  onNext: customOnNext,
  onPrev: customOnPrev, 
  children,
}: StepLayoutProps) => {
  const { goNext, goPrev } = useStepNav();
  
  const handleNext = customOnNext || goNext;
  const handlePrev = customOnPrev || goPrev;

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        background: "#fff",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          border: "2px solid #222",
          margin: 16,
          padding: 0,
          height: "calc(100vh - 32px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#444",
            color: "#fff",
            padding: "8px 16px",
            position: "relative", 
            flex: "0 0 auto",
            height: 60
          }}
        >
          {/* Left: Logo and Back button together */}
          <div style={{ display: "flex", alignItems: "center", minWidth: 0, zIndex: 2 }}>
            {notPractice &&
              <img src={logo} alt="VitaLITy 2" style={{ height: 32, marginRight: 8 }} />
            }
            {showPrev && (
              <button
                style={{
                  background: "#FFC700",
                  color: "#222",
                  fontWeight: 700,
                  fontSize: 20,
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 20px",
                  marginLeft: 4,
                  cursor: !disableNext ? "pointer" : "not-allowed",
                  opacity: !disableNext ? 1 : 0.6
                }}
                onClick={handlePrev}
                disabled={disableNext}
              >
                Back
              </button>
            )}
          </div>

          {/* Center: Title */}
          <div style={{ 
            position: "absolute", 
            left: "50%", 
            transform: "translateX(-50%)",
            zIndex: 1 
          }}>
            <span style={{ fontWeight: 700, fontSize: 24 }}>{title}</span>
          </div>

          {/* Right: Next button */}
          <div style={{ width: 150, display: "flex", justifyContent: "flex-end", marginLeft: "auto", zIndex: 2 }}>
            {showNext && (
              <button
                style={{
                  background: "#FFC700",
                  color: "#222",
                  fontWeight: 700,
                  fontSize: 20,
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 24px",
                  cursor: !disableNext ? "pointer": "not-allowed",
                  opacity: !disableNext ? 1 : 0.6
                }}
                onClick={handleNext}
                disabled={disableNext}
              >
                {nextButtonText}
              </button>
            )}
          </div>
        </div>

        {/* scrollable content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
          }}
          className="hide-scrollbar"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default StepLayout;