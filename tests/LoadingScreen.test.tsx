/**
 * Tests for LoadingScreen component
 * Tests rendering with different props and states
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import LoadingScreen from "../src/components/LoadingScreen";

// Mock console.log to avoid noise
const originalConsoleLog = console.log;

describe("LoadingScreen", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    console.log = jest.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    document.body.removeChild(container);
    (container as any) = null;
  });

  describe("rendering", () => {
    it("should render with default props", () => {
      ReactDOM.render(<LoadingScreen />, container);

      expect(container.textContent).toContain("Loading...");
      expect(container.textContent).toContain("0%");
    });

    it("should render custom message", () => {
      ReactDOM.render(
        <LoadingScreen message="Fetching papers..." />,
        container
      );

      expect(container.textContent).toContain("Fetching papers...");
    });

    it("should render sub-message when provided", () => {
      ReactDOM.render(
        <LoadingScreen 
          message="Loading" 
          subMessage="Please wait while we load your data" 
        />,
        container
      );

      expect(container.textContent).toContain("Please wait while we load your data");
    });

    it("should not render sub-message when not provided", () => {
      ReactDOM.render(
        <LoadingScreen message="Loading" />,
        container
      );

      // Should have loading-screen class but no sub-message
      expect(container.querySelector(".loading-sub-message")).toBeNull();
    });
  });

  describe("progress calculation", () => {
    it("should display 0% for progress=0", () => {
      ReactDOM.render(<LoadingScreen progress={0} />, container);
      expect(container.textContent).toContain("0%");
    });

    it("should display 50% for progress=0.5", () => {
      ReactDOM.render(<LoadingScreen progress={0.5} />, container);
      expect(container.textContent).toContain("50%");
    });

    it("should display 100% for progress=1", () => {
      ReactDOM.render(<LoadingScreen progress={1} />, container);
      expect(container.textContent).toContain("100%");
    });

    it("should round progress percentage correctly", () => {
      ReactDOM.render(<LoadingScreen progress={0.333} />, container);
      expect(container.textContent).toContain("33%");
    });

    it("should handle progress=0.999 as 100%", () => {
      ReactDOM.render(<LoadingScreen progress={0.999} />, container);
      expect(container.textContent).toContain("100%");
    });

    it("should handle small progress values", () => {
      ReactDOM.render(<LoadingScreen progress={0.01} />, container);
      expect(container.textContent).toContain("1%");
    });
  });

  describe("CSS classes", () => {
    it("should have loading-screen class on container", () => {
      ReactDOM.render(<LoadingScreen />, container);
      expect(container.querySelector(".loading-screen")).not.toBeNull();
    });

    it("should have loading-content class", () => {
      ReactDOM.render(<LoadingScreen />, container);
      expect(container.querySelector(".loading-content")).not.toBeNull();
    });

    it("should have loading-message class on message element", () => {
      ReactDOM.render(<LoadingScreen />, container);
      expect(container.querySelector(".loading-message")).not.toBeNull();
    });

    it("should have progress-container class", () => {
      ReactDOM.render(<LoadingScreen />, container);
      expect(container.querySelector(".progress-container")).not.toBeNull();
    });
  });

  describe("all props combined", () => {
    it("should render correctly with all props", () => {
      ReactDOM.render(
        <LoadingScreen
          message="Loading VitaLITy..."
          subMessage="Fetching 2000 papers from database"
          progress={0.75}
        />,
        container
      );

      expect(container.textContent).toContain("Loading VitaLITy...");
      expect(container.textContent).toContain("Fetching 2000 papers from database");
      expect(container.textContent).toContain("75%");
    });
  });

  describe("console logging", () => {
    it("should log progress when rendering", () => {
      ReactDOM.render(<LoadingScreen progress={0.5} />, container);
      expect(console.log).toHaveBeenCalledWith('🔄 LoadingScreen rendering, progress:', 0.5);
    });
  });
});
