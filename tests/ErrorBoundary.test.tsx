/**
 * Tests for ErrorBoundary component
 * Tests error catching and fallback UI rendering
 * Using ReactDOM.render since @testing-library/react is not installed
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import ErrorBoundary from "../src/structure/ErrorBoundary";

// Component that throws an error on purpose
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div data-testid="normal-content">Normal content</div>;
};

// Mock console.error to prevent noise in test output
const originalConsoleError = console.error;

describe("ErrorBoundary", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    console.error = jest.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    console.error = originalConsoleError;
    document.body.removeChild(container);
    (container as any) = null;
  });

  describe("normal operation", () => {
    it("should render children when no error occurs", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>,
        container
      );

      expect(container.textContent).toContain("Test content");
    });

    it("should render multiple children correctly", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>,
        container
      );

      expect(container.textContent).toContain("Child 1");
      expect(container.textContent).toContain("Child 2");
      expect(container.textContent).toContain("Child 3");
    });

    it("should render nested components correctly", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <div>
            <span>Nested content</span>
          </div>
        </ErrorBoundary>,
        container
      );

      expect(container.textContent).toContain("Nested content");
    });
  });

  describe("error handling", () => {
    it("should display error UI when child component throws", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
        container
      );

      expect(container.textContent).toContain("Something went wrong");
    });

    it("should display error details section", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
        container
      );

      expect(container.textContent).toContain("Error Details");
    });

    it("should show the error message in the details", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
        container
      );

      expect(container.textContent).toContain("Test error message");
    });

    it("should render reload button when error occurs", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
        container
      );

      const reloadButton = container.querySelector("button");
      expect(reloadButton).not.toBeNull();
      expect(reloadButton?.textContent).toContain("Reload Page");
    });

    it("should not render children when error occurs", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
        container
      );

      expect(container.textContent).not.toContain("Normal content");
    });
  });

  describe("reload functionality", () => {
    it("should call window.location.reload when button is clicked", () => {
      // Mock window.location.reload
      const reloadMock = jest.fn();
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...originalLocation, reload: reloadMock },
      });

      ReactDOM.render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
        container
      );

      const reloadButton = container.querySelector("button");
      expect(reloadButton).not.toBeNull();
      reloadButton?.click();

      expect(reloadMock).toHaveBeenCalled();

      // Restore window.location
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    });
  });

  describe("console error logging", () => {
    it("should log error to console when error is caught", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
        container
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("component behavior", () => {
    it("should catch errors from deeply nested children", () => {
      const DeeplyNestedThrow = () => (
        <div>
          <div>
            <div>
              <ThrowingComponent shouldThrow={true} />
            </div>
          </div>
        </div>
      );

      ReactDOM.render(
        <ErrorBoundary>
          <DeeplyNestedThrow />
        </ErrorBoundary>,
        container
      );

      expect(container.textContent).toContain("Something went wrong");
    });

    it("should render normally when shouldThrow is false", () => {
      ReactDOM.render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
        container
      );

      expect(container.textContent).toContain("Normal content");
      expect(container.textContent).not.toContain("Something went wrong");
    });
  });
});
