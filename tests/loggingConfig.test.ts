/**
 * Tests for loggingConfig utility module
 * Tests the global logging enable/disable toggle functionality
 */

import { setLoggingEnabled, isLoggingEnabled } from "../src/utils/loggingConfig";

describe("loggingConfig", () => {
  describe("setLoggingEnabled", () => {
    it("should enable logging when passed true", () => {
      setLoggingEnabled(true);
      expect(isLoggingEnabled()).toBe(true);
    });

    it("should disable logging when passed false", () => {
      setLoggingEnabled(false);
      expect(isLoggingEnabled()).toBe(false);
    });

    it("should toggle logging state correctly", () => {
      setLoggingEnabled(true);
      expect(isLoggingEnabled()).toBe(true);
      
      setLoggingEnabled(false);
      expect(isLoggingEnabled()).toBe(false);
      
      setLoggingEnabled(true);
      expect(isLoggingEnabled()).toBe(true);
    });
  });

  describe("isLoggingEnabled", () => {
    it("should return boolean value", () => {
      setLoggingEnabled(true);
      const result = isLoggingEnabled();
      expect(typeof result).toBe("boolean");
    });

    it("should persist state between calls", () => {
      setLoggingEnabled(true);
      expect(isLoggingEnabled()).toBe(true);
      expect(isLoggingEnabled()).toBe(true);
      expect(isLoggingEnabled()).toBe(true);
    });

    it("should return false by default after disabling", () => {
      setLoggingEnabled(false);
      expect(isLoggingEnabled()).toBe(false);
    });
  });

  describe("integration scenarios", () => {
    it("should work correctly in rapid toggle scenarios", () => {
      for (let i = 0; i < 10; i++) {
        setLoggingEnabled(i % 2 === 0);
        expect(isLoggingEnabled()).toBe(i % 2 === 0);
      }
    });
  });
});
