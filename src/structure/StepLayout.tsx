import * as React from "react";
import logo from "../assets/img/vitality-logo-2.png";
import { useStepNav } from "../hooks/useStepNav";
import { colors, typography, spacing, borderRadius, shadows, transitions } from "../styles/studyDesignSystem";

export type StepLayoutProps = {
  title: string;
  showNext?: boolean;
  showPrev?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  disableNext?: boolean;
  notPractice?: boolean;
  nextButtonText?: string;
  highlightNext?: boolean;
  children: React.ReactNode;
};

const StepLayout = ({
  title,
  showNext = false,
  showPrev = false,
  disableNext = false,
  notPractice = true,
  nextButtonText = "Next",
  highlightNext = false,
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
        fontFamily: typography.fontFamily.main,
        background: colors.background.subtle,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          border: `1px solid ${colors.border.main}`,
          margin: 16,
          padding: 0,
          height: "calc(100vh - 32px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
          borderRadius: borderRadius.lg,
          background: colors.background.main,
          boxShadow: shadows.lg,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(135deg, ${colors.neutral.dark} 0%, ${colors.neutral.medium} 100%)`,
            color: colors.neutral.white,
            padding: `${spacing.md} ${spacing.lg}`,
            position: "relative",
            flex: "0 0 auto",
            height: 60,
            borderTopLeftRadius: borderRadius.lg,
            borderTopRightRadius: borderRadius.lg,
            boxShadow: shadows.sm,
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
                  background: colors.primary.main,
                  color: colors.neutral.darkest,
                  fontWeight: typography.fontWeight.bold,
                  fontSize: typography.fontSize.lg,
                  border: "none",
                  borderRadius: borderRadius.md,
                  padding: `${spacing.sm} ${spacing.lg}`,
                  marginLeft: spacing.sm,
                  cursor: !disableNext ? "pointer" : "not-allowed",
                  opacity: !disableNext ? 1 : 0.5,
                  transition: `all ${transitions.normal}`,
                  boxShadow: shadows.sm,
                }}
                onClick={handlePrev}
                disabled={disableNext}
                onMouseEnter={(e) => {
                  if (!disableNext) {
                    (e.target as HTMLButtonElement).style.background = colors.primary.dark;
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    (e.target as HTMLButtonElement).style.boxShadow = shadows.md;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disableNext) {
                    (e.target as HTMLButtonElement).style.background = colors.primary.main;
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.target as HTMLButtonElement).style.boxShadow = shadows.sm;
                  }
                }}
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
            zIndex: 1,
          }}>
            <span style={{
              fontWeight: typography.fontWeight.bold,
              fontSize: typography.fontSize['2xl'],
              letterSpacing: '-0.5px',
            }}>{title}</span>
          </div>

          {/* Right: Next button */}
          <div style={{ width: 150, display: "flex", justifyContent: "flex-end", marginLeft: "auto", zIndex: 2 }}>
            {showNext && (
              <>
                <style>
                  {`
                    @keyframes pulse-glow {
                      0%, 100% {
                        box-shadow: 0 0 10px rgba(255, 199, 0, 0.5), 0 0 20px rgba(255, 199, 0, 0.3);
                      }
                      50% {
                        box-shadow: 0 0 20px rgba(255, 199, 0, 0.8), 0 0 30px rgba(255, 199, 0, 0.5);
                      }
                    }
                  `}
                </style>
                <button
                  style={{
                    background: colors.primary.main,
                    color: colors.neutral.darkest,
                    fontWeight: typography.fontWeight.bold,
                    fontSize: typography.fontSize.lg,
                    border: "none",
                    borderRadius: borderRadius.md,
                    padding: `${spacing.sm} ${spacing.lg}`,
                    cursor: !disableNext ? "pointer" : "not-allowed",
                    opacity: !disableNext ? 1 : 0.5,
                    transition: `all ${transitions.normal}`,
                    boxShadow: highlightNext ? '0 0 15px rgba(255, 199, 0, 0.6), 0 0 25px rgba(255, 199, 0, 0.4)' : shadows.sm,
                    animation: highlightNext ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                  }}
                  onClick={handleNext}
                  disabled={disableNext}
                  onMouseEnter={(e) => {
                    if (!disableNext) {
                      (e.target as HTMLButtonElement).style.background = colors.primary.dark;
                      (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                      if (!highlightNext) {
                        (e.target as HTMLButtonElement).style.boxShadow = shadows.md;
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!disableNext) {
                      (e.target as HTMLButtonElement).style.background = colors.primary.main;
                      (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                      if (!highlightNext) {
                        (e.target as HTMLButtonElement).style.boxShadow = shadows.sm;
                      }
                    }
                  }}
                >
                  {nextButtonText}
                </button>
              </>
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