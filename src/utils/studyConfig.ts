/**
 * Study Configuration and ID Obfuscation
 * Maps obfuscated study codes to actual study IDs to prevent participants
 * from easily identifying or switching study conditions
 */

// Obfuscated study code mappings
const STUDY_CODE_MAP: { [key: string]: number } = {
  'a7f3k9': 1,  // Study 1 (qualitative)
  'b2x8m4': 2,  // Study 2 (quantitative)
};

// Reverse mapping for encoding
const STUDY_ID_TO_CODE: { [key: number]: string } = {
  1: 'a7f3k9',
  2: 'b2x8m4',
};

/**
 * Decode an obfuscated study code to the actual study ID
 * @param code - Obfuscated study code from URL
 * @returns Study ID (1 or 2) or 1 as default
 */
export function decodeStudyCode(code: string | null): number {
  if (!code) return 1;
  return STUDY_CODE_MAP[code.toLowerCase()] || 1;
}

/**
 * Encode a study ID to an obfuscated code
 * @param studyId - The study ID (1 or 2)
 * @returns Obfuscated study code
 */
export function encodeStudyId(studyId: number): string {
  return STUDY_ID_TO_CODE[studyId] || STUDY_ID_TO_CODE[1];
}

/**
 * Validate if a study code is valid
 * @param code - Study code to validate
 * @returns true if valid, false otherwise
 */
export function isValidStudyCode(code: string | null): boolean {
  if (!code) return false;
  return code.toLowerCase() in STUDY_CODE_MAP;
}
