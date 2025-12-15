/**
 * PaperScatter Utility Functions
 * 
 * Pure functions for UMAP visualization data processing
 * Used by PaperScatter component and tested independently
 */

// ============================================
// TYPES
// ============================================

export interface PaperWithEmbedding {
  ID: string;
  Title?: string;
  Source?: string;
  Year?: number;
  [key: string]: any;
}

export interface EmbeddingBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface Centroid {
  x: number;
  y: number;
  count: number;
}

// ============================================
// EMBEDDING FUNCTIONS
// ============================================

/**
 * Calculate the bounding box for embedding coordinates
 * Used to set the initial view range of the scatterplot
 * @param papers - Array of papers with embeddings
 * @param embeddingKey - The key for the embedding array (e.g., 'specter_umap')
 * @returns Bounding box with xMin, xMax, yMin, yMax
 */
export function calculateEmbeddingBounds(
  papers: PaperWithEmbedding[],
  embeddingKey: string
): EmbeddingBounds {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  papers.forEach(paper => {
    const embedding = paper[embeddingKey];
    if (embedding && Array.isArray(embedding) && embedding.length >= 2) {
      const [x, y] = embedding;
      if (!isNaN(x) && !isNaN(y)) {
        xMin = Math.min(xMin, x);
        xMax = Math.max(xMax, x);
        yMin = Math.min(yMin, y);
        yMax = Math.max(yMax, y);
      }
    }
  });

  return {
    xMin: xMin === Infinity ? 0 : xMin,
    xMax: xMax === -Infinity ? 0 : xMax,
    yMin: yMin === Infinity ? 0 : yMin,
    yMax: yMax === -Infinity ? 0 : yMax,
  };
}

/**
 * Calculate the centroid of selected points
 * Used to center the camera on selected papers
 * @param papers - Array of all papers
 * @param selectedIds - Array of selected paper IDs
 * @param embeddingKey - The key for the embedding array
 * @returns Centroid with x, y coordinates and count of valid points
 */
export function calculateSelectionCentroid(
  papers: PaperWithEmbedding[],
  selectedIds: string[],
  embeddingKey: string
): Centroid {
  let sumX = 0;
  let sumY = 0;
  let validCount = 0;

  papers.forEach(paper => {
    if (selectedIds.includes(paper.ID)) {
      const embedding = paper[embeddingKey];
      if (embedding && !isNaN(embedding[0]) && !isNaN(embedding[1])) {
        sumX += embedding[0];
        sumY += embedding[1];
        validCount++;
      }
    }
  });

  return {
    x: validCount > 0 ? sumX / validCount : 0,
    y: validCount > 0 ? sumY / validCount : 0,
    count: validCount,
  };
}

/**
 * Get indices of selected papers in the data array
 * Used to highlight points in the scatterplot
 * @param papers - Array of papers
 * @param selectedIds - Array of selected paper IDs
 * @returns Array of indices
 */
export function getSelectedIndices(
  papers: PaperWithEmbedding[],
  selectedIds: string[]
): number[] {
  const indices: number[] = [];
  papers.forEach((paper, idx) => {
    if (selectedIds.includes(paper.ID)) {
      indices.push(idx);
    }
  });
  return indices;
}

/**
 * Get papers by their indices
 * @param papers - Array of papers
 * @param indices - Array of indices
 * @returns Array of papers at those indices
 */
export function getPapersByIndices(
  papers: PaperWithEmbedding[],
  indices: number[]
): PaperWithEmbedding[] {
  return indices
    .filter(idx => idx >= 0 && idx < papers.length)
    .map(idx => papers[idx]);
}

// ============================================
// COLOR FUNCTIONS
// ============================================

/**
 * Assigns colors to papers based on a categorical attribute
 * Used for color-coding by Source, Year, etc.
 * @param papers - Array of papers
 * @param attribute - The attribute to color by
 * @param colorPalette - Array of hex color strings
 * @returns Map of attribute values to colors
 */
export function assignColorsByAttribute(
  papers: PaperWithEmbedding[],
  attribute: string,
  colorPalette: string[]
): Map<string, string> {
  const uniqueValues = new Set<string>();
  papers.forEach(paper => {
    if (paper[attribute] !== undefined && paper[attribute] !== null) {
      uniqueValues.add(String(paper[attribute]));
    }
  });

  const colorMap = new Map<string, string>();
  const sortedValues = Array.from(uniqueValues).sort();
  sortedValues.forEach((value, index) => {
    colorMap.set(value, colorPalette[index % colorPalette.length]);
  });

  return colorMap;
}

/**
 * Get color for a paper based on its attribute value
 * @param paper - The paper
 * @param attribute - The attribute to get color for
 * @param colorMap - Map of attribute values to colors
 * @param defaultColor - Default color if not found
 * @returns Hex color string
 */
export function getColorForPaper(
  paper: PaperWithEmbedding,
  attribute: string,
  colorMap: Map<string, string>,
  defaultColor: string = '#cccccc'
): string {
  const value = paper[attribute];
  if (value === undefined || value === null) return defaultColor;
  return colorMap.get(String(value)) || defaultColor;
}

// ============================================
// OPACITY & SIZE FUNCTIONS
// ============================================

/**
 * Determines point opacity based on paper state
 * @param isFiltered - Paper matches current filters
 * @param isSimilar - Paper is in similar papers list
 * @param isSaved - Paper is saved
 * @param isSelected - Paper is currently selected
 * @returns Opacity value between 0 and 1
 */
export function calculatePointOpacity(
  isFiltered: boolean,
  isSimilar: boolean,
  isSaved: boolean,
  isSelected: boolean
): number {
  if (isSelected) return 1.0;
  if (isSaved) return 0.9;
  if (isSimilar) return 0.8;
  if (isFiltered) return 0.6;
  return 0.3; // Default/background opacity
}

/**
 * Determines point size based on paper state
 * @param isSelected - Paper is currently selected
 * @param baseSize - Base point size
 * @returns Point size
 */
export function calculatePointSize(
  isSelected: boolean,
  baseSize: number = 3
): number {
  return isSelected ? baseSize * 2 : baseSize;
}

// ============================================
// DATA PREPARATION FUNCTIONS
// ============================================

/**
 * Prepares paper data for scatterplot rendering
 * @param papers - Array of papers with embeddings
 * @param embeddingKey - The embedding key to use
 * @returns Array of [x, y] coordinate tuples
 */
export function prepareScatterData(
  papers: PaperWithEmbedding[],
  embeddingKey: string
): [number, number][] {
  return papers.map(paper => {
    const embedding = paper[embeddingKey];
    if (embedding && Array.isArray(embedding) && embedding.length >= 2) {
      return [embedding[0], embedding[1]] as [number, number];
    }
    return [0, 0] as [number, number];
  });
}

/**
 * Filters papers that have valid embeddings
 * @param papers - Array of papers
 * @param embeddingKey - The embedding key to check
 * @returns Papers with valid embeddings
 */
export function filterPapersWithEmbeddings(
  papers: PaperWithEmbedding[],
  embeddingKey: string
): PaperWithEmbedding[] {
  return papers.filter(paper => {
    const embedding = paper[embeddingKey];
    return embedding && 
           Array.isArray(embedding) && 
           embedding.length >= 2 &&
           !isNaN(embedding[0]) && 
           !isNaN(embedding[1]);
  });
}

/**
 * Counts papers by embedding availability
 * @param papers - Array of papers
 * @param embeddingKeys - Array of embedding keys to check
 * @returns Object with counts for each embedding type
 */
export function countPapersByEmbedding(
  papers: PaperWithEmbedding[],
  embeddingKeys: string[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  embeddingKeys.forEach(key => {
    counts[key] = filterPapersWithEmbeddings(papers, key).length;
  });
  return counts;
}
