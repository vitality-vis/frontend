/**
 * SmartTable Utility Functions
 * 
 * Pure functions for filtering, searching, and data processing
 * Used by SmartTable component and tested independently
 */

// ============================================
// TYPES
// ============================================

export interface Paper {
  ID: string | number;
  Title?: string;
  Author?: string | string[];
  Keyword?: string | string[];
  Year?: number;
  Source?: string;
  CitationCounts?: number;
  Sim?: number;
  [key: string]: any;
}

export interface FilterRange {
  min: number;
  max: number;
}

// ============================================
// FILTER FUNCTIONS
// ============================================

/**
 * Filters an array of papers by a numeric range (e.g., Year, CitationCounts)
 * @param papers - Array of papers to filter
 * @param field - The numeric field to filter on
 * @param range - Tuple of [min, max] values (inclusive)
 * @returns Filtered array of papers
 */
export function filterByNumberRange(
  papers: Paper[],
  field: string,
  range: [number, number] | undefined
): Paper[] {
  if (!range || range.length !== 2) return papers;
  const [min, max] = range;
  return papers.filter(paper => {
    const value = paper[field];
    if (value === undefined || value === null) return false;
    return value >= min && value <= max;
  });
}

/**
 * Filters papers by checking if a field contains any of the selected tokens
 * Used for Author, Keyword, Source filters (array or string fields)
 * @param papers - Array of papers to filter
 * @param field - The field to filter on (can be array or string)
 * @param selectedTokens - Array of tokens to match against
 * @returns Filtered array of papers
 */
export function filterByTokens(
  papers: Paper[],
  field: string,
  selectedTokens: string[]
): Paper[] {
  if (!selectedTokens || selectedTokens.length === 0) return papers;
  return papers.filter(paper => {
    const fieldValue = paper[field];
    if (!fieldValue) return false;
    const tokens = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
    return tokens.some(token => selectedTokens.includes(token));
  });
}

/**
 * Global text search across multiple fields
 * Performs case-insensitive partial matching
 * @param papers - Array of papers to search
 * @param searchTerm - The search string
 * @param fields - Array of field names to search in
 * @returns Filtered array of papers matching the search
 */
export function globalTextSearch(
  papers: Paper[],
  searchTerm: string,
  fields: string[]
): Paper[] {
  if (!searchTerm || searchTerm.trim() === '') return papers;
  const lowerSearchTerm = searchTerm.toLowerCase();
  return papers.filter(paper => {
    return fields.some(field => {
      const value = paper[field];
      if (!value) return false;
      if (Array.isArray(value)) {
        return value.some(v => 
          String(v).toLowerCase().includes(lowerSearchTerm)
        );
      }
      return String(value).toLowerCase().includes(lowerSearchTerm);
    });
  });
}

/**
 * Fuzzy text matching for a single field
 * @param value - The value to search in
 * @param searchTerm - The search term
 * @returns True if the value contains the search term
 */
export function fuzzyTextMatch(value: any, searchTerm: string): boolean {
  if (!searchTerm || searchTerm.trim() === '') return true;
  if (value === undefined || value === null) return false;
  return String(value).toLowerCase().includes(searchTerm.toLowerCase());
}

// ============================================
// EXTRACTION FUNCTIONS
// ============================================

/**
 * Extracts unique values from an array field across all papers
 * Used to populate filter dropdown options
 * @param papers - Array of papers
 * @param field - The field to extract values from (can be array)
 * @returns Sorted array of unique string values
 */
export function extractUniqueTokens(
  papers: Paper[],
  field: string
): string[] {
  const tokenSet = new Set<string>();
  papers.forEach(paper => {
    const fieldValue = paper[field];
    if (fieldValue) {
      const tokens = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      tokens.forEach(token => {
        if (token && String(token).length > 0) {
          tokenSet.add(String(token));
        }
      });
    }
  });
  return Array.from(tokenSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Calculates min and max values for a numeric field
 * Used to set slider range for number filters
 * @param papers - Array of papers
 * @param field - The numeric field to analyze
 * @returns Object with min and max values
 */
export function getNumericRange(
  papers: Paper[],
  field: string
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  papers.forEach(paper => {
    const value = paper[field];
    if (typeof value === 'number' && !isNaN(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  });
  return {
    min: min === Infinity ? 0 : min,
    max: max === -Infinity ? 0 : max,
  };
}

// ============================================
// SORTING FUNCTIONS
// ============================================

/**
 * Sorts papers by a field in ascending or descending order
 * @param papers - Array of papers to sort
 * @param field - The field to sort by
 * @param direction - 'asc' or 'desc'
 * @returns New sorted array
 */
export function sortPapers(
  papers: Paper[],
  field: string,
  direction: 'asc' | 'desc' = 'asc'
): Paper[] {
  return [...papers].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    // Handle undefined/null
    if (aVal === undefined || aVal === null) return direction === 'asc' ? 1 : -1;
    if (bVal === undefined || bVal === null) return direction === 'asc' ? -1 : 1;
    
    // Numeric comparison
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    // String comparison
    const comparison = String(aVal).localeCompare(String(bVal));
    return direction === 'asc' ? comparison : -comparison;
  });
}

// ============================================
// AGGREGATION FUNCTIONS
// ============================================

/**
 * Counts papers by a field value
 * @param papers - Array of papers
 * @param field - The field to group by
 * @returns Map of field values to counts
 */
export function countByField(
  papers: Paper[],
  field: string
): Map<string, number> {
  const counts = new Map<string, number>();
  papers.forEach(paper => {
    const value = paper[field];
    if (value !== undefined && value !== null) {
      const key = String(value);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });
  return counts;
}

/**
 * Groups papers by a field value
 * @param papers - Array of papers
 * @param field - The field to group by
 * @returns Map of field values to arrays of papers
 */
export function groupByField(
  papers: Paper[],
  field: string
): Map<string, Paper[]> {
  const groups = new Map<string, Paper[]>();
  papers.forEach(paper => {
    const value = paper[field];
    if (value !== undefined && value !== null) {
      const key = String(value);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(paper);
    }
  });
  return groups;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates that a paper has required fields
 * @param paper - Paper object to validate
 * @param requiredFields - Array of required field names
 * @returns True if paper has all required fields
 */
export function validatePaper(
  paper: Paper,
  requiredFields: string[] = ['ID', 'Title']
): boolean {
  return requiredFields.every(field => 
    paper[field] !== undefined && paper[field] !== null
  );
}

/**
 * Filters out papers with missing required fields
 * @param papers - Array of papers
 * @param requiredFields - Array of required field names
 * @returns Array of valid papers
 */
export function filterValidPapers(
  papers: Paper[],
  requiredFields: string[] = ['ID', 'Title']
): Paper[] {
  return papers.filter(paper => validatePaper(paper, requiredFields));
}
