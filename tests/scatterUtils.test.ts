/**
 * Tests for PaperScatter Utility Functions
 * 
 * Tests the REAL utility functions from src/utils/scatterUtils.ts
 * These functions handle UMAP visualization data processing
 */

import {
  calculateEmbeddingBounds,
  calculateSelectionCentroid,
  getSelectedIndices,
  getPapersByIndices,
  assignColorsByAttribute,
  getColorForPaper,
  calculatePointOpacity,
  calculatePointSize,
  prepareScatterData,
  filterPapersWithEmbeddings,
  countPapersByEmbedding,
  PaperWithEmbedding,
} from '../src/utils/scatterUtils';

// ============================================
// TEST DATA
// ============================================

const mockPapersWithEmbeddings: PaperWithEmbedding[] = [
  {
    ID: "paper-1",
    Title: "Paper One",
    Source: "CHI",
    Year: 2020,
    specter_umap: [1.5, 2.3],
    glove_umap: [0.8, 1.2],
  },
  {
    ID: "paper-2",
    Title: "Paper Two",
    Source: "VIS",
    Year: 2021,
    specter_umap: [-0.5, 1.8],
    glove_umap: [-1.0, 0.5],
  },
  {
    ID: "paper-3",
    Title: "Paper Three",
    Source: "CHI",
    Year: 2020,
    specter_umap: [2.1, -0.5],
    glove_umap: [1.5, -0.8],
  },
  {
    ID: "paper-4",
    Title: "Paper Four",
    Source: "NeurIPS",
    Year: 2022,
    specter_umap: [0.0, 0.0],
    glove_umap: [0.0, 0.0],
  },
  {
    ID: "paper-5",
    Title: "Paper Five",
    Source: "CHI",
    Year: 2019,
    specter_umap: [-1.2, -1.8],
    glove_umap: [-2.0, -1.5],
  },
];

const testColorPalette = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99'];

// ============================================
// EMBEDDING BOUNDS TESTS
// ============================================

describe("scatterUtils - calculateEmbeddingBounds", () => {
  it("should calculate correct bounds for specter_umap", () => {
    const result = calculateEmbeddingBounds(mockPapersWithEmbeddings, "specter_umap");
    expect(result.xMin).toBe(-1.2);
    expect(result.xMax).toBe(2.1);
    expect(result.yMin).toBe(-1.8);
    expect(result.yMax).toBe(2.3);
  });

  it("should calculate correct bounds for glove_umap", () => {
    const result = calculateEmbeddingBounds(mockPapersWithEmbeddings, "glove_umap");
    expect(result.xMin).toBe(-2.0);
    expect(result.xMax).toBe(1.5);
    expect(result.yMin).toBe(-1.5);
    expect(result.yMax).toBe(1.2);
  });

  it("should return zeros for empty array", () => {
    const result = calculateEmbeddingBounds([], "specter_umap");
    expect(result).toEqual({ xMin: 0, xMax: 0, yMin: 0, yMax: 0 });
  });

  it("should handle papers without embeddings", () => {
    const papersWithMissing: PaperWithEmbedding[] = [
      { ID: "1", specter_umap: [1, 2] },
      { ID: "2" }, // No embedding
      { ID: "3", specter_umap: [3, 4] },
    ];
    const result = calculateEmbeddingBounds(papersWithMissing, "specter_umap");
    expect(result.xMin).toBe(1);
    expect(result.xMax).toBe(3);
  });

  it("should handle NaN values in embeddings", () => {
    const papersWithNaN: PaperWithEmbedding[] = [
      { ID: "1", specter_umap: [1, 2] },
      { ID: "2", specter_umap: [NaN, NaN] },
      { ID: "3", specter_umap: [3, 4] },
    ];
    const result = calculateEmbeddingBounds(papersWithNaN, "specter_umap");
    expect(result.xMin).toBe(1);
    expect(result.xMax).toBe(3);
  });
});

// ============================================
// SELECTION CENTROID TESTS
// ============================================

describe("scatterUtils - calculateSelectionCentroid", () => {
  it("should calculate centroid of single selected paper", () => {
    const result = calculateSelectionCentroid(
      mockPapersWithEmbeddings,
      ["paper-1"],
      "specter_umap"
    );
    expect(result.x).toBe(1.5);
    expect(result.y).toBe(2.3);
    expect(result.count).toBe(1);
  });

  it("should calculate centroid of multiple selected papers", () => {
    const result = calculateSelectionCentroid(
      mockPapersWithEmbeddings,
      ["paper-1", "paper-4"], // (1.5, 2.3) and (0, 0)
      "specter_umap"
    );
    expect(result.x).toBe(0.75); // (1.5 + 0) / 2
    expect(result.y).toBe(1.15); // (2.3 + 0) / 2
    expect(result.count).toBe(2);
  });

  it("should return origin for no selection", () => {
    const result = calculateSelectionCentroid(
      mockPapersWithEmbeddings,
      [],
      "specter_umap"
    );
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.count).toBe(0);
  });

  it("should ignore papers not in selection", () => {
    const result = calculateSelectionCentroid(
      mockPapersWithEmbeddings,
      ["paper-nonexistent"],
      "specter_umap"
    );
    expect(result.count).toBe(0);
  });

  it("should handle selection with some missing embeddings", () => {
    const papersWithMissing: PaperWithEmbedding[] = [
      { ID: "1", specter_umap: [2, 4] },
      { ID: "2" }, // No embedding
    ];
    const result = calculateSelectionCentroid(papersWithMissing, ["1", "2"], "specter_umap");
    expect(result.x).toBe(2);
    expect(result.y).toBe(4);
    expect(result.count).toBe(1);
  });
});

// ============================================
// SELECTION INDICES TESTS
// ============================================

describe("scatterUtils - getSelectedIndices", () => {
  it("should return indices of selected papers", () => {
    const result = getSelectedIndices(mockPapersWithEmbeddings, ["paper-1", "paper-3"]);
    expect(result).toEqual([0, 2]);
  });

  it("should return empty array for no selection", () => {
    const result = getSelectedIndices(mockPapersWithEmbeddings, []);
    expect(result).toEqual([]);
  });

  it("should handle non-existent IDs", () => {
    const result = getSelectedIndices(mockPapersWithEmbeddings, ["nonexistent"]);
    expect(result).toEqual([]);
  });

  it("should return all indices when all selected", () => {
    const allIds = mockPapersWithEmbeddings.map(p => p.ID);
    const result = getSelectedIndices(mockPapersWithEmbeddings, allIds);
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("scatterUtils - getPapersByIndices", () => {
  it("should return papers at specified indices", () => {
    const result = getPapersByIndices(mockPapersWithEmbeddings, [0, 2]);
    expect(result).toHaveLength(2);
    expect(result[0].ID).toBe("paper-1");
    expect(result[1].ID).toBe("paper-3");
  });

  it("should handle out of bounds indices", () => {
    const result = getPapersByIndices(mockPapersWithEmbeddings, [0, 100, 2]);
    expect(result).toHaveLength(2);
  });

  it("should handle negative indices", () => {
    const result = getPapersByIndices(mockPapersWithEmbeddings, [-1, 0, 1]);
    expect(result).toHaveLength(2);
  });

  it("should return empty array for empty indices", () => {
    const result = getPapersByIndices(mockPapersWithEmbeddings, []);
    expect(result).toEqual([]);
  });
});

// ============================================
// COLOR ASSIGNMENT TESTS
// ============================================

describe("scatterUtils - assignColorsByAttribute", () => {
  it("should assign colors by Source", () => {
    const colorMap = assignColorsByAttribute(
      mockPapersWithEmbeddings,
      "Source",
      testColorPalette
    );
    
    expect(colorMap.size).toBe(3);
    expect(colorMap.get("CHI")).toBe(testColorPalette[0]);
    expect(colorMap.get("NeurIPS")).toBe(testColorPalette[1]);
    expect(colorMap.get("VIS")).toBe(testColorPalette[2]);
  });

  it("should assign colors by Year", () => {
    const colorMap = assignColorsByAttribute(
      mockPapersWithEmbeddings,
      "Year",
      testColorPalette
    );
    
    expect(colorMap.size).toBe(4);
  });

  it("should cycle colors when more values than palette", () => {
    const smallPalette = ['#red', '#blue'];
    const colorMap = assignColorsByAttribute(
      mockPapersWithEmbeddings,
      "Year",
      smallPalette
    );
    
    const colors = Array.from(colorMap.values());
    expect(colors[0]).toBe('#red');
    expect(colors[1]).toBe('#blue');
    expect(colors[2]).toBe('#red');
    expect(colors[3]).toBe('#blue');
  });

  it("should handle empty data", () => {
    const colorMap = assignColorsByAttribute([], "Source", testColorPalette);
    expect(colorMap.size).toBe(0);
  });
});

describe("scatterUtils - getColorForPaper", () => {
  it("should return correct color for paper", () => {
    const colorMap = assignColorsByAttribute(
      mockPapersWithEmbeddings,
      "Source",
      testColorPalette
    );
    
    const color = getColorForPaper(mockPapersWithEmbeddings[0], "Source", colorMap);
    expect(color).toBe(testColorPalette[0]); // CHI
  });

  it("should return default color for missing attribute", () => {
    const colorMap = new Map<string, string>();
    const color = getColorForPaper({ ID: "test" }, "Source", colorMap, "#default");
    expect(color).toBe("#default");
  });

  it("should return default color for null value", () => {
    const colorMap = new Map<string, string>();
    const paper = { ID: "test", Source: null as any };
    const color = getColorForPaper(paper, "Source", colorMap, "#default");
    expect(color).toBe("#default");
  });
});

// ============================================
// OPACITY & SIZE TESTS
// ============================================

describe("scatterUtils - calculatePointOpacity", () => {
  it("should return 1.0 for selected papers", () => {
    expect(calculatePointOpacity(false, false, false, true)).toBe(1.0);
  });

  it("should return 0.9 for saved papers", () => {
    expect(calculatePointOpacity(false, false, true, false)).toBe(0.9);
  });

  it("should return 0.8 for similar papers", () => {
    expect(calculatePointOpacity(false, true, false, false)).toBe(0.8);
  });

  it("should return 0.6 for filtered papers", () => {
    expect(calculatePointOpacity(true, false, false, false)).toBe(0.6);
  });

  it("should return 0.3 for background papers", () => {
    expect(calculatePointOpacity(false, false, false, false)).toBe(0.3);
  });

  it("should prioritize selected over other states", () => {
    expect(calculatePointOpacity(true, true, true, true)).toBe(1.0);
  });
});

describe("scatterUtils - calculatePointSize", () => {
  it("should return base size for unselected papers", () => {
    expect(calculatePointSize(false, 3)).toBe(3);
  });

  it("should return double size for selected papers", () => {
    expect(calculatePointSize(true, 3)).toBe(6);
  });

  it("should use default base size of 3", () => {
    expect(calculatePointSize(false)).toBe(3);
  });

  it("should work with custom base sizes", () => {
    expect(calculatePointSize(false, 5)).toBe(5);
    expect(calculatePointSize(true, 5)).toBe(10);
  });
});

// ============================================
// DATA PREPARATION TESTS
// ============================================

describe("scatterUtils - prepareScatterData", () => {
  it("should extract coordinates from embeddings", () => {
    const result = prepareScatterData(mockPapersWithEmbeddings, "specter_umap");
    expect(result[0]).toEqual([1.5, 2.3]);
    expect(result[1]).toEqual([-0.5, 1.8]);
  });

  it("should return [0, 0] for missing embeddings", () => {
    const papers: PaperWithEmbedding[] = [{ ID: "1" }];
    const result = prepareScatterData(papers, "specter_umap");
    expect(result[0]).toEqual([0, 0]);
  });

  it("should preserve order", () => {
    const result = prepareScatterData(mockPapersWithEmbeddings, "specter_umap");
    expect(result).toHaveLength(5);
    expect(result[4]).toEqual([-1.2, -1.8]);
  });
});

describe("scatterUtils - filterPapersWithEmbeddings", () => {
  it("should filter papers with valid embeddings", () => {
    const papers: PaperWithEmbedding[] = [
      { ID: "1", specter_umap: [1, 2] },
      { ID: "2" },
      { ID: "3", specter_umap: [3, 4] },
    ];
    const result = filterPapersWithEmbeddings(papers, "specter_umap");
    expect(result).toHaveLength(2);
  });

  it("should exclude papers with NaN embeddings", () => {
    const papers: PaperWithEmbedding[] = [
      { ID: "1", specter_umap: [1, 2] },
      { ID: "2", specter_umap: [NaN, NaN] },
    ];
    const result = filterPapersWithEmbeddings(papers, "specter_umap");
    expect(result).toHaveLength(1);
  });

  it("should exclude papers with incomplete embeddings", () => {
    const papers: PaperWithEmbedding[] = [
      { ID: "1", specter_umap: [1, 2] },
      { ID: "2", specter_umap: [1] as any },
    ];
    const result = filterPapersWithEmbeddings(papers, "specter_umap");
    expect(result).toHaveLength(1);
  });
});

describe("scatterUtils - countPapersByEmbedding", () => {
  it("should count papers by embedding type", () => {
    const result = countPapersByEmbedding(
      mockPapersWithEmbeddings,
      ["specter_umap", "glove_umap"]
    );
    expect(result["specter_umap"]).toBe(5);
    expect(result["glove_umap"]).toBe(5);
  });

  it("should return 0 for missing embedding type", () => {
    const result = countPapersByEmbedding(
      mockPapersWithEmbeddings,
      ["nonexistent_umap"]
    );
    expect(result["nonexistent_umap"]).toBe(0);
  });
});

// ============================================
// INTEGRATION SCENARIOS
// ============================================

describe("scatterUtils - integration scenarios", () => {
  it("should correctly process a typical selection workflow", () => {
    const selectedIds = ["paper-1", "paper-3"];
    
    const indices = getSelectedIndices(mockPapersWithEmbeddings, selectedIds);
    expect(indices).toEqual([0, 2]);
    
    const centroid = calculateSelectionCentroid(
      mockPapersWithEmbeddings,
      selectedIds,
      "specter_umap"
    );
    expect(centroid.x).toBeCloseTo(1.8);
    expect(centroid.y).toBeCloseTo(0.9);
  });

  it("should handle color coding by source with selection", () => {
    const colorMap = assignColorsByAttribute(
      mockPapersWithEmbeddings,
      "Source",
      testColorPalette
    );
    
    const chiPapers = mockPapersWithEmbeddings.filter(p => p.Source === "CHI");
    expect(chiPapers).toHaveLength(3);
    
    const chiColor = colorMap.get("CHI");
    expect(chiColor).toBeDefined();
  });

  it("should prepare scatter data and filter in one flow", () => {
    const validPapers = filterPapersWithEmbeddings(mockPapersWithEmbeddings, "specter_umap");
    const scatterData = prepareScatterData(validPapers, "specter_umap");
    const bounds = calculateEmbeddingBounds(validPapers, "specter_umap");
    
    expect(scatterData).toHaveLength(5);
    expect(bounds.xMin).toBeLessThan(bounds.xMax);
  });
});
