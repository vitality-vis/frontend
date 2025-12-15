/**
 * Tests for SmartTable Utility Functions
 * 
 * Tests the REAL utility functions from src/utils/tableUtils.ts
 * These functions are used by SmartTable for filtering, searching, and data processing
 */

import {
  filterByNumberRange,
  filterByTokens,
  globalTextSearch,
  fuzzyTextMatch,
  extractUniqueTokens,
  getNumericRange,
  sortPapers,
  countByField,
  groupByField,
  validatePaper,
  filterValidPapers,
  Paper,
} from '../src/utils/tableUtils';

// ============================================
// TEST DATA
// ============================================

const mockPapers: Paper[] = [
  {
    ID: 1,
    Title: "Machine Learning for Visualization",
    Author: ["John Smith", "Jane Doe"],
    Keyword: ["machine learning", "visualization", "HCI"],
    Year: 2020,
    Source: "CHI",
    CitationCounts: 45
  },
  {
    ID: 2,
    Title: "Natural Language Processing in Research",
    Author: ["Alice Johnson", "Bob Wilson"],
    Keyword: ["NLP", "text analysis"],
    Year: 2021,
    Source: "VIS",
    CitationCounts: 30
  },
  {
    ID: 3,
    Title: "Interactive Data Exploration",
    Author: ["John Smith", "Charlie Brown"],
    Keyword: ["visualization", "interaction", "data"],
    Year: 2019,
    Source: "CHI",
    CitationCounts: 75
  },
  {
    ID: 4,
    Title: "Deep Learning Approaches",
    Author: ["Jane Doe"],
    Keyword: ["deep learning", "neural networks"],
    Year: 2022,
    Source: "NeurIPS",
    CitationCounts: 120
  },
  {
    ID: 5,
    Title: "User Study Methods",
    Author: ["Emily Chen", "David Lee"],
    Keyword: ["HCI", "user study", "methodology"],
    Year: 2020,
    Source: "CHI",
    CitationCounts: 22
  }
];

// ============================================
// FILTER FUNCTION TESTS
// ============================================

describe("tableUtils - filterByNumberRange", () => {
  it("should filter papers within year range", () => {
    const result = filterByNumberRange(mockPapers, "Year", [2020, 2021]);
    expect(result).toHaveLength(3);
    expect(result.map(p => p.ID)).toEqual([1, 2, 5]);
  });

  it("should return all papers when range covers all years", () => {
    const result = filterByNumberRange(mockPapers, "Year", [2019, 2022]);
    expect(result).toHaveLength(5);
  });

  it("should return empty array when no papers match range", () => {
    const result = filterByNumberRange(mockPapers, "Year", [2025, 2030]);
    expect(result).toHaveLength(0);
  });

  it("should filter by citation counts", () => {
    const result = filterByNumberRange(mockPapers, "CitationCounts", [30, 80]);
    expect(result).toHaveLength(3);
    expect(result.map(p => p.ID)).toEqual([1, 2, 3]);
  });

  it("should handle inclusive boundaries", () => {
    const result = filterByNumberRange(mockPapers, "Year", [2020, 2020]);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.ID)).toEqual([1, 5]);
  });

  it("should return all items when range is undefined", () => {
    const result = filterByNumberRange(mockPapers, "Year", undefined);
    expect(result).toHaveLength(5);
  });

  it("should handle papers with missing field values", () => {
    const papersWithMissing = [
      ...mockPapers,
      { ID: 6, Title: "No Year Paper", Author: ["Test"], Year: null as any }
    ];
    const result = filterByNumberRange(papersWithMissing, "Year", [2019, 2022]);
    expect(result).toHaveLength(5);
  });
});

describe("tableUtils - filterByTokens", () => {
  it("should filter by single author", () => {
    const result = filterByTokens(mockPapers, "Author", ["John Smith"]);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.ID)).toEqual([1, 3]);
  });

  it("should filter by multiple authors (OR logic)", () => {
    const result = filterByTokens(mockPapers, "Author", ["John Smith", "Alice Johnson"]);
    expect(result).toHaveLength(3);
    expect(result.map(p => p.ID)).toEqual([1, 2, 3]);
  });

  it("should filter by keyword", () => {
    const result = filterByTokens(mockPapers, "Keyword", ["HCI"]);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.ID)).toEqual([1, 5]);
  });

  it("should filter by source", () => {
    const result = filterByTokens(mockPapers, "Source", ["CHI"]);
    expect(result).toHaveLength(3);
    expect(result.map(p => p.ID)).toEqual([1, 3, 5]);
  });

  it("should return all items when tokens array is empty", () => {
    const result = filterByTokens(mockPapers, "Author", []);
    expect(result).toHaveLength(5);
  });

  it("should return empty array when no matches found", () => {
    const result = filterByTokens(mockPapers, "Author", ["Nonexistent Author"]);
    expect(result).toHaveLength(0);
  });

  it("should handle string field as single token", () => {
    const result = filterByTokens(mockPapers, "Source", ["VIS"]);
    expect(result).toHaveLength(1);
    expect(result[0].ID).toBe(2);
  });
});

describe("tableUtils - globalTextSearch", () => {
  it("should search in title", () => {
    const result = globalTextSearch(mockPapers, "Machine Learning", ["Title"]);
    expect(result).toHaveLength(1);
    expect(result[0].ID).toBe(1);
  });

  it("should be case-insensitive", () => {
    const result = globalTextSearch(mockPapers, "VISUALIZATION", ["Title", "Keyword"]);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.ID)).toEqual([1, 3]);
  });

  it("should search across multiple fields", () => {
    const result = globalTextSearch(mockPapers, "John Smith", ["Title", "Author"]);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.ID)).toEqual([1, 3]);
  });

  it("should search in array fields (Authors)", () => {
    const result = globalTextSearch(mockPapers, "Jane", ["Author"]);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.ID)).toEqual([1, 4]);
  });

  it("should return all items when search term is empty", () => {
    const result = globalTextSearch(mockPapers, "", ["Title"]);
    expect(result).toHaveLength(5);
  });

  it("should return all items when search term is whitespace", () => {
    const result = globalTextSearch(mockPapers, "   ", ["Title"]);
    expect(result).toHaveLength(5);
  });

  it("should find partial matches", () => {
    const result = globalTextSearch(mockPapers, "Learn", ["Title", "Keyword"]);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.ID)).toEqual([1, 4]);
  });

  it("should search in keyword arrays", () => {
    const result = globalTextSearch(mockPapers, "neural", ["Keyword"]);
    expect(result).toHaveLength(1);
    expect(result[0].ID).toBe(4);
  });
});

describe("tableUtils - fuzzyTextMatch", () => {
  it("should match partial strings", () => {
    expect(fuzzyTextMatch("Machine Learning", "Learn")).toBe(true);
  });

  it("should be case-insensitive", () => {
    expect(fuzzyTextMatch("Machine Learning", "MACHINE")).toBe(true);
  });

  it("should return true for empty search term", () => {
    expect(fuzzyTextMatch("Machine Learning", "")).toBe(true);
  });

  it("should return false for non-matching strings", () => {
    expect(fuzzyTextMatch("Machine Learning", "xyz")).toBe(false);
  });

  it("should handle null/undefined values", () => {
    expect(fuzzyTextMatch(null, "test")).toBe(false);
    expect(fuzzyTextMatch(undefined, "test")).toBe(false);
  });
});

describe("tableUtils - extractUniqueTokens", () => {
  it("should extract unique authors", () => {
    const result = extractUniqueTokens(mockPapers, "Author");
    expect(result).toContain("John Smith");
    expect(result).toContain("Jane Doe");
    expect(result).toContain("Alice Johnson");
  });

  it("should extract unique keywords", () => {
    const result = extractUniqueTokens(mockPapers, "Keyword");
    expect(result).toContain("visualization");
    expect(result).toContain("HCI");
    expect(result).toContain("machine learning");
  });

  it("should extract unique sources", () => {
    const result = extractUniqueTokens(mockPapers, "Source");
    expect(result).toEqual(["CHI", "NeurIPS", "VIS"]);
  });

  it("should return sorted array", () => {
    const result = extractUniqueTokens(mockPapers, "Source");
    const sortedResult = [...result].sort();
    expect(result).toEqual(sortedResult);
  });

  it("should not include duplicates", () => {
    const result = extractUniqueTokens(mockPapers, "Author");
    const johnCount = result.filter(a => a === "John Smith").length;
    expect(johnCount).toBe(1);
  });

  it("should handle empty array field", () => {
    const papersWithEmpty = [
      { ID: 1, Keyword: [] },
      { ID: 2, Keyword: ["test"] }
    ];
    const result = extractUniqueTokens(papersWithEmpty, "Keyword");
    expect(result).toEqual(["test"]);
  });
});

describe("tableUtils - getNumericRange", () => {
  it("should return min and max years", () => {
    const result = getNumericRange(mockPapers, "Year");
    expect(result).toEqual({ min: 2019, max: 2022 });
  });

  it("should return min and max citation counts", () => {
    const result = getNumericRange(mockPapers, "CitationCounts");
    expect(result).toEqual({ min: 22, max: 120 });
  });

  it("should return zeros for empty array", () => {
    const result = getNumericRange([], "Year");
    expect(result).toEqual({ min: 0, max: 0 });
  });

  it("should handle single item array", () => {
    const result = getNumericRange([{ ID: 1, Year: 2020 }], "Year");
    expect(result).toEqual({ min: 2020, max: 2020 });
  });

  it("should ignore non-numeric values", () => {
    const papersWithInvalid = [
      { ID: 1, Year: 2020 },
      { ID: 2, Year: "invalid" as any },
      { ID: 3, Year: 2022 }
    ];
    const result = getNumericRange(papersWithInvalid, "Year");
    expect(result).toEqual({ min: 2020, max: 2022 });
  });
});

describe("tableUtils - sortPapers", () => {
  it("should sort by year ascending", () => {
    const result = sortPapers(mockPapers, "Year", "asc");
    expect(result[0].Year).toBe(2019);
    expect(result[result.length - 1].Year).toBe(2022);
  });

  it("should sort by year descending", () => {
    const result = sortPapers(mockPapers, "Year", "desc");
    expect(result[0].Year).toBe(2022);
    expect(result[result.length - 1].Year).toBe(2019);
  });

  it("should sort by title alphabetically", () => {
    const result = sortPapers(mockPapers, "Title", "asc");
    expect(result[0].Title).toBe("Deep Learning Approaches");
    expect(result[result.length - 1].Title).toBe("User Study Methods");
  });

  it("should not modify original array", () => {
    const original = [...mockPapers];
    sortPapers(mockPapers, "Year", "desc");
    expect(mockPapers).toEqual(original);
  });

  it("should handle null values", () => {
    const papersWithNull = [
      { ID: 1, Year: 2020 },
      { ID: 2, Year: null as any },
      { ID: 3, Year: 2019 }
    ];
    const result = sortPapers(papersWithNull, "Year", "asc");
    // Null values should be at the end for ascending
    expect(result[result.length - 1].Year).toBeNull();
  });
});

describe("tableUtils - countByField", () => {
  it("should count papers by source", () => {
    const result = countByField(mockPapers, "Source");
    expect(result.get("CHI")).toBe(3);
    expect(result.get("VIS")).toBe(1);
    expect(result.get("NeurIPS")).toBe(1);
  });

  it("should count papers by year", () => {
    const result = countByField(mockPapers, "Year");
    expect(result.get("2020")).toBe(2);
    expect(result.get("2019")).toBe(1);
  });
});

describe("tableUtils - groupByField", () => {
  it("should group papers by source", () => {
    const result = groupByField(mockPapers, "Source");
    expect(result.get("CHI")).toHaveLength(3);
    expect(result.get("VIS")).toHaveLength(1);
  });

  it("should preserve paper data in groups", () => {
    const result = groupByField(mockPapers, "Source");
    const chiPapers = result.get("CHI");
    expect(chiPapers![0].Title).toBeDefined();
  });
});

describe("tableUtils - validatePaper", () => {
  it("should validate paper with required fields", () => {
    expect(validatePaper(mockPapers[0], ["ID", "Title"])).toBe(true);
  });

  it("should invalidate paper missing required fields", () => {
    const invalid = { ID: 1 };
    expect(validatePaper(invalid, ["ID", "Title"])).toBe(false);
  });

  it("should use default required fields", () => {
    expect(validatePaper(mockPapers[0])).toBe(true);
    expect(validatePaper({ ID: 1 })).toBe(false);
  });
});

describe("tableUtils - filterValidPapers", () => {
  it("should filter out invalid papers", () => {
    const papers: any[] = [
      { ID: 1, Title: "Valid" },
      { ID: 2 }, // Missing Title
      { Title: "No ID" }, // Missing ID
      { ID: 3, Title: "Also Valid" }
    ];
    const result = filterValidPapers(papers);
    expect(result).toHaveLength(2);
  });
});

describe("tableUtils - combined filter scenarios", () => {
  it("should chain number range and token filters", () => {
    let result = filterByNumberRange(mockPapers, "Year", [2020, 2022]);
    result = filterByTokens(result, "Source", ["CHI"]);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.ID)).toEqual([1, 5]);
  });

  it("should chain all filter types", () => {
    let result = filterByNumberRange(mockPapers, "Year", [2019, 2021]);
    result = filterByTokens(result, "Source", ["CHI"]);
    result = globalTextSearch(result, "visualization", ["Title", "Keyword"]);
    expect(result).toHaveLength(2);
    expect(result.map(p => p.ID)).toEqual([1, 3]);
  });

  it("should find papers with high citation counts about ML", () => {
    let result = filterByNumberRange(mockPapers, "CitationCounts", [50, 200]);
    result = globalTextSearch(result, "learning", ["Title", "Keyword"]);
    expect(result).toHaveLength(1);
    expect(result[0].Title).toBe("Deep Learning Approaches");
  });
});
