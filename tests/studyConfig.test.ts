/**
 * Tests for studyConfig utility module
 * Tests study code obfuscation and validation functions
 */

import { 
  decodeStudyCode, 
  encodeStudyId, 
  isValidStudyCode 
} from "../src/utils/studyConfig";

describe("studyConfig", () => {
  describe("decodeStudyCode", () => {
    it("should decode 'a7f3k9' to study ID 1", () => {
      expect(decodeStudyCode("a7f3k9")).toBe(1);
    });

    it("should decode 'b2x8m4' to study ID 2", () => {
      expect(decodeStudyCode("b2x8m4")).toBe(2);
    });

    it("should return 1 (default) for invalid study code", () => {
      expect(decodeStudyCode("invalid")).toBe(1);
    });

    it("should return 1 (default) for empty string", () => {
      expect(decodeStudyCode("")).toBe(1);
    });

    it("should return 1 (default) for null input", () => {
      expect(decodeStudyCode(null)).toBe(1);
    });

    it("should return 1 (default) for undefined input", () => {
      expect(decodeStudyCode(undefined as any)).toBe(1);
    });

    it("should be case-insensitive (uppercase should work)", () => {
      expect(decodeStudyCode("A7F3K9")).toBe(1);
      expect(decodeStudyCode("B2X8M4")).toBe(2);
    });

    it("should handle mixed case", () => {
      expect(decodeStudyCode("A7f3K9")).toBe(1);
      expect(decodeStudyCode("B2X8m4")).toBe(2);
    });

    it("should return 1 (default) for partial matches", () => {
      expect(decodeStudyCode("a7f3")).toBe(1);
      expect(decodeStudyCode("a7f3k9extra")).toBe(1);
    });
  });

  describe("encodeStudyId", () => {
    it("should encode study ID 1 to 'a7f3k9'", () => {
      expect(encodeStudyId(1)).toBe("a7f3k9");
    });

    it("should encode study ID 2 to 'b2x8m4'", () => {
      expect(encodeStudyId(2)).toBe("b2x8m4");
    });

    it("should return 'a7f3k9' (default) for invalid study ID", () => {
      expect(encodeStudyId(3)).toBe("a7f3k9");
      expect(encodeStudyId(0)).toBe("a7f3k9");
      expect(encodeStudyId(-1)).toBe("a7f3k9");
    });

    it("should return 'a7f3k9' (default) for non-integer values", () => {
      expect(encodeStudyId(1.5)).toBe("a7f3k9");
      expect(encodeStudyId(NaN)).toBe("a7f3k9");
    });

    it("should return 'a7f3k9' (default) for null/undefined input", () => {
      expect(encodeStudyId(null as any)).toBe("a7f3k9");
      expect(encodeStudyId(undefined as any)).toBe("a7f3k9");
    });
  });

  describe("isValidStudyCode", () => {
    it("should return true for valid study code 'a7f3k9'", () => {
      expect(isValidStudyCode("a7f3k9")).toBe(true);
    });

    it("should return true for valid study code 'b2x8m4'", () => {
      expect(isValidStudyCode("b2x8m4")).toBe(true);
    });

    it("should return false for invalid study codes", () => {
      expect(isValidStudyCode("invalid")).toBe(false);
      expect(isValidStudyCode("abc123")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidStudyCode("")).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isValidStudyCode(null)).toBe(false);
      expect(isValidStudyCode(undefined as any)).toBe(false);
    });

    it("should be case-insensitive (uppercase should work)", () => {
      expect(isValidStudyCode("A7F3K9")).toBe(true);
      expect(isValidStudyCode("B2X8M4")).toBe(true);
    });

    it("should handle mixed case", () => {
      expect(isValidStudyCode("A7f3K9")).toBe(true);
      expect(isValidStudyCode("b2X8M4")).toBe(true);
    });
  });

  describe("encode/decode roundtrip", () => {
    it("should roundtrip study ID 1 correctly", () => {
      const encoded = encodeStudyId(1);
      expect(encoded).toBe("a7f3k9");
      const decoded = decodeStudyCode(encoded);
      expect(decoded).toBe(1);
    });

    it("should roundtrip study ID 2 correctly", () => {
      const encoded = encodeStudyId(2);
      expect(encoded).toBe("b2x8m4");
      const decoded = decodeStudyCode(encoded);
      expect(decoded).toBe(2);
    });

    it("valid study codes should decode and re-encode correctly", () => {
      const code1 = "a7f3k9";
      const decoded1 = decodeStudyCode(code1);
      expect(decoded1).toBe(1);
      expect(encodeStudyId(decoded1)).toBe(code1);

      const code2 = "b2x8m4";
      const decoded2 = decodeStudyCode(code2);
      expect(decoded2).toBe(2);
      expect(encodeStudyId(decoded2)).toBe(code2);
    });
  });
});
