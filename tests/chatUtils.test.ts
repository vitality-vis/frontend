/**
 * Tests for Chat/Dialog Utility Functions
 * 
 * Tests the REAL utility functions from src/utils/chatUtils.ts
 * These functions handle chat history, input validation, and response processing
 */

import {
  addToChatHistory,
  formatHistoryForAPI,
  clearChatHistory,
  getLastMessages,
  validateChatInput,
  sanitizeInput,
  extractPaperTitlesFromResponse,
  truncateResponse,
  isErrorResponse,
  isLoadingResponse,
  accumulateStreamingResponse,
  estimateTokenCount,
  calculateHistoryTokens,
  enhanceQueryWithContext,
  isQueryAboutPapers,
  ChatMessage,
} from '../src/utils/chatUtils';

// ============================================
// CHAT HISTORY TESTS
// ============================================

describe("chatUtils - addToChatHistory", () => {
  it("should add message to empty history", () => {
    const result = addToChatHistory([], "Hello", "Hi there!");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ human: "Hello", ai: "Hi there!" });
  });

  it("should append to existing history", () => {
    const existing: ChatMessage[] = [{ human: "First", ai: "Response 1" }];
    const result = addToChatHistory(existing, "Second", "Response 2");
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ human: "Second", ai: "Response 2" });
  });

  it("should maintain message order", () => {
    let history: ChatMessage[] = [];
    history = addToChatHistory(history, "Q1", "A1");
    history = addToChatHistory(history, "Q2", "A2");
    history = addToChatHistory(history, "Q3", "A3");
    
    expect(history[0].human).toBe("Q1");
    expect(history[1].human).toBe("Q2");
    expect(history[2].human).toBe("Q3");
  });

  it("should enforce max messages limit", () => {
    let history: ChatMessage[] = [];
    for (let i = 1; i <= 15; i++) {
      history = addToChatHistory(history, `Q${i}`, `A${i}`, 10);
    }
    
    expect(history).toHaveLength(10);
    expect(history[0].human).toBe("Q6");
    expect(history[9].human).toBe("Q15");
  });

  it("should not modify original array", () => {
    const original: ChatMessage[] = [{ human: "Original", ai: "Response" }];
    const result = addToChatHistory(original, "New", "New Response");
    
    expect(original).toHaveLength(1);
    expect(result).toHaveLength(2);
  });

  it("should handle custom max limit of 3", () => {
    let history: ChatMessage[] = [];
    history = addToChatHistory(history, "Q1", "A1", 3);
    history = addToChatHistory(history, "Q2", "A2", 3);
    history = addToChatHistory(history, "Q3", "A3", 3);
    history = addToChatHistory(history, "Q4", "A4", 3);
    
    expect(history).toHaveLength(3);
    expect(history[0].human).toBe("Q2");
  });
});

describe("chatUtils - formatHistoryForAPI", () => {
  it("should format single message correctly", () => {
    const history: ChatMessage[] = [{ human: "Hello", ai: "Hi there!" }];
    const result = formatHistoryForAPI(history);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ role: "user", content: "Hello" });
    expect(result[1]).toEqual({ role: "assistant", content: "Hi there!" });
  });

  it("should format multiple messages in order", () => {
    const history: ChatMessage[] = [
      { human: "Q1", ai: "A1" },
      { human: "Q2", ai: "A2" },
    ];
    const result = formatHistoryForAPI(history);
    
    expect(result).toHaveLength(4);
    expect(result[0].content).toBe("Q1");
    expect(result[1].content).toBe("A1");
    expect(result[2].content).toBe("Q2");
    expect(result[3].content).toBe("A2");
  });

  it("should return empty array for empty history", () => {
    const result = formatHistoryForAPI([]);
    expect(result).toEqual([]);
  });

  it("should alternate user and assistant roles", () => {
    const history: ChatMessage[] = [
      { human: "Q1", ai: "A1" },
      { human: "Q2", ai: "A2" },
      { human: "Q3", ai: "A3" },
    ];
    const result = formatHistoryForAPI(history);
    
    expect(result[0].role).toBe("user");
    expect(result[1].role).toBe("assistant");
    expect(result[2].role).toBe("user");
    expect(result[3].role).toBe("assistant");
  });
});

describe("chatUtils - clearChatHistory", () => {
  it("should return empty array", () => {
    const result = clearChatHistory();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});

describe("chatUtils - getLastMessages", () => {
  const history: ChatMessage[] = [
    { human: "Q1", ai: "A1" },
    { human: "Q2", ai: "A2" },
    { human: "Q3", ai: "A3" },
    { human: "Q4", ai: "A4" },
  ];

  it("should get last N messages", () => {
    const result = getLastMessages(history, 2);
    expect(result).toHaveLength(2);
    expect(result[0].human).toBe("Q3");
    expect(result[1].human).toBe("Q4");
  });

  it("should return all messages if count exceeds length", () => {
    const result = getLastMessages(history, 10);
    expect(result).toHaveLength(4);
  });

  it("should return empty array for count of 0", () => {
    const result = getLastMessages(history, 0);
    expect(result).toHaveLength(0);
  });
});

// ============================================
// INPUT VALIDATION TESTS
// ============================================

describe("chatUtils - validateChatInput", () => {
  it("should accept valid input", () => {
    const result = validateChatInput("Find papers about machine learning");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject empty string", () => {
    const result = validateChatInput("");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("enter a question");
  });

  it("should reject whitespace-only input", () => {
    const result = validateChatInput("   ");
    expect(result.valid).toBe(false);
  });

  it("should reject input over max length", () => {
    const longInput = "a".repeat(2001);
    const result = validateChatInput(longInput);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too long");
  });

  it("should accept input exactly at max length", () => {
    const exactInput = "a".repeat(2000);
    const result = validateChatInput(exactInput);
    expect(result.valid).toBe(true);
  });

  it("should handle null gracefully", () => {
    const result = validateChatInput(null);
    expect(result.valid).toBe(false);
  });

  it("should handle undefined gracefully", () => {
    const result = validateChatInput(undefined);
    expect(result.valid).toBe(false);
  });

  it("should respect custom max length", () => {
    const result = validateChatInput("12345", 3);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("max 3 characters");
  });
});

describe("chatUtils - sanitizeInput", () => {
  it("should trim whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("should collapse multiple spaces", () => {
    expect(sanitizeInput("hello    world")).toBe("hello world");
  });

  it("should handle empty string", () => {
    expect(sanitizeInput("")).toBe("");
  });

  it("should handle null/undefined", () => {
    expect(sanitizeInput(null as any)).toBe("");
    expect(sanitizeInput(undefined as any)).toBe("");
  });

  it("should preserve single spaces", () => {
    expect(sanitizeInput("hello world")).toBe("hello world");
  });
});

// ============================================
// RESPONSE PROCESSING TESTS
// ============================================

describe("chatUtils - extractPaperTitlesFromResponse", () => {
  it("should extract bold markdown titles", () => {
    const response = "Here are relevant papers: **Machine Learning for Viz** and **Data Analysis**";
    const titles = extractPaperTitlesFromResponse(response);
    
    expect(titles).toContain("Machine Learning for Viz");
    expect(titles).toContain("Data Analysis");
  });

  it("should return empty array for response without titles", () => {
    const response = "I found no relevant papers for your query.";
    const titles = extractPaperTitlesFromResponse(response);
    
    expect(titles).toHaveLength(0);
  });

  it("should not include very short titles", () => {
    const response = "**ML** is about **Machine Learning Methods**";
    const titles = extractPaperTitlesFromResponse(response);
    
    expect(titles).not.toContain("ML");
    expect(titles).toContain("Machine Learning Methods");
  });

  it("should not include duplicates", () => {
    const response = "**Paper A** and **Paper A** are mentioned twice";
    const titles = extractPaperTitlesFromResponse(response);
    
    expect(titles.filter(t => t === "Paper A")).toHaveLength(1);
  });
});

describe("chatUtils - truncateResponse", () => {
  it("should not truncate short responses", () => {
    const short = "This is a short response.";
    expect(truncateResponse(short)).toBe(short);
  });

  it("should truncate long responses with ellipsis", () => {
    const long = "a".repeat(600);
    const result = truncateResponse(long);
    
    expect(result.length).toBe(503);
    expect(result.endsWith("...")).toBe(true);
  });

  it("should respect custom max length", () => {
    const text = "This is exactly twenty-five";
    const result = truncateResponse(text, 10);
    
    expect(result.length).toBe(13);
    expect(result).toBe("This is ex...");
  });

  it("should handle exactly max length", () => {
    const text = "12345";
    expect(truncateResponse(text, 5)).toBe("12345");
  });

  it("should handle empty string", () => {
    expect(truncateResponse("")).toBe("");
  });
});

describe("chatUtils - isErrorResponse", () => {
  it("should detect error keywords", () => {
    expect(isErrorResponse("Error: Something went wrong")).toBe(true);
    expect(isErrorResponse("The request failed")).toBe(true);
    expect(isErrorResponse("Unable to process your query")).toBe(true);
    expect(isErrorResponse("An exception occurred")).toBe(true);
    expect(isErrorResponse("Connection timed out")).toBe(true);
  });

  it("should be case-insensitive", () => {
    expect(isErrorResponse("ERROR")).toBe(true);
    expect(isErrorResponse("Failed")).toBe(true);
    expect(isErrorResponse("UNABLE TO")).toBe(true);
  });

  it("should not flag normal responses", () => {
    expect(isErrorResponse("Here are your results")).toBe(false);
    expect(isErrorResponse("I found 5 relevant papers")).toBe(false);
  });

  it("should handle empty string", () => {
    expect(isErrorResponse("")).toBe(false);
  });
});

describe("chatUtils - isLoadingResponse", () => {
  it("should detect loading states", () => {
    expect(isLoadingResponse("Running...")).toBe(true);
    expect(isLoadingResponse("Loading...")).toBe(true);
    expect(isLoadingResponse("Processing your request...")).toBe(true);
  });

  it("should detect trailing ellipsis", () => {
    expect(isLoadingResponse("Please wait...")).toBe(true);
  });

  it("should not flag completed responses", () => {
    expect(isLoadingResponse("Here are your results")).toBe(false);
    expect(isLoadingResponse("Found 5 papers")).toBe(false);
  });

  it("should handle empty string", () => {
    expect(isLoadingResponse("")).toBe(false);
  });
});

// ============================================
// STREAMING RESPONSE TESTS
// ============================================

describe("chatUtils - accumulateStreamingResponse", () => {
  it("should combine chunks into full response", () => {
    const chunks = ["Hello ", "World", "!"];
    const result = accumulateStreamingResponse(chunks);
    expect(result).toBe("Hello World!");
  });

  it("should handle single chunk", () => {
    const chunks = ["Complete response"];
    const result = accumulateStreamingResponse(chunks);
    expect(result).toBe("Complete response");
  });

  it("should handle empty chunks", () => {
    const chunks: string[] = [];
    const result = accumulateStreamingResponse(chunks);
    expect(result).toBe("");
  });

  it("should handle many small chunks", () => {
    const chunks = "Hello World".split("");
    const result = accumulateStreamingResponse(chunks);
    expect(result).toBe("Hello World");
  });
});

describe("chatUtils - estimateTokenCount", () => {
  it("should estimate tokens for short text", () => {
    const result = estimateTokenCount("Hello world");
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(10);
  });

  it("should return 0 for empty string", () => {
    expect(estimateTokenCount("")).toBe(0);
  });

  it("should handle null/undefined", () => {
    expect(estimateTokenCount(null as any)).toBe(0);
    expect(estimateTokenCount(undefined as any)).toBe(0);
  });

  it("should scale with text length", () => {
    const short = estimateTokenCount("Short");
    const long = estimateTokenCount("This is a much longer piece of text");
    expect(long).toBeGreaterThan(short);
  });
});

describe("chatUtils - calculateHistoryTokens", () => {
  it("should calculate total tokens for history", () => {
    const history: ChatMessage[] = [
      { human: "Short question", ai: "Short answer" },
    ];
    const result = calculateHistoryTokens(history);
    expect(result).toBeGreaterThan(0);
  });

  it("should return 0 for empty history", () => {
    expect(calculateHistoryTokens([])).toBe(0);
  });

  it("should accumulate across messages", () => {
    const history1: ChatMessage[] = [{ human: "Q1", ai: "A1" }];
    const history2: ChatMessage[] = [
      { human: "Q1", ai: "A1" },
      { human: "Q2", ai: "A2" },
    ];
    
    expect(calculateHistoryTokens(history2)).toBeGreaterThan(
      calculateHistoryTokens(history1)
    );
  });
});

// ============================================
// QUERY ENHANCEMENT TESTS
// ============================================

describe("chatUtils - enhanceQueryWithContext", () => {
  it("should enhance query with paper titles", () => {
    const result = enhanceQueryWithContext(
      "Tell me more",
      ["Paper A", "Paper B"]
    );
    
    expect(result).toContain("Paper A");
    expect(result).toContain("Paper B");
    expect(result).toContain("Tell me more");
  });

  it("should return original query when no papers selected", () => {
    const query = "Find visualization papers";
    expect(enhanceQueryWithContext(query, [])).toBe(query);
  });

  it("should handle null paper list", () => {
    const query = "Find papers";
    expect(enhanceQueryWithContext(query, null as any)).toBe(query);
  });
});

describe("chatUtils - isQueryAboutPapers", () => {
  it("should detect paper-related queries", () => {
    expect(isQueryAboutPapers("Find papers about ML")).toBe(true);
    expect(isQueryAboutPapers("Show me research on visualization")).toBe(true);
    expect(isQueryAboutPapers("Who is the author?")).toBe(true);
    expect(isQueryAboutPapers("Search for articles")).toBe(true);
  });

  it("should return false for general queries", () => {
    expect(isQueryAboutPapers("What is machine learning?")).toBe(false);
    expect(isQueryAboutPapers("How does UMAP work?")).toBe(false);
  });

  it("should handle empty/null", () => {
    expect(isQueryAboutPapers("")).toBe(false);
    expect(isQueryAboutPapers(null as any)).toBe(false);
  });
});

// ============================================
// INTEGRATION SCENARIOS
// ============================================

describe("chatUtils - integration scenarios", () => {
  it("should simulate a complete chat flow", () => {
    let history: ChatMessage[] = [];
    
    // First question
    const q1 = "Find papers about visualization";
    const validation1 = validateChatInput(q1);
    expect(validation1.valid).toBe(true);
    
    // Simulate response
    const a1 = "I found **Interactive Data Visualization** and **Visual Analytics** as relevant papers.";
    history = addToChatHistory(history, q1, a1);
    
    // Extract titles
    const titles = extractPaperTitlesFromResponse(a1);
    expect(titles).toContain("Interactive Data Visualization");
    
    // Follow-up question
    const q2 = "Tell me more about the first one";
    history = addToChatHistory(history, q2, "The paper discusses...");
    
    // Format for API
    const apiFormat = formatHistoryForAPI(history);
    expect(apiFormat).toHaveLength(4);
  });

  it("should handle error scenarios gracefully", () => {
    // Invalid input
    const badValidation = validateChatInput("");
    expect(badValidation.valid).toBe(false);
    
    // Error response detection
    const errorResponse = "Error: Unable to connect to the database";
    expect(isErrorResponse(errorResponse)).toBe(true);
    
    // Even errors get added to history for context
    let history: ChatMessage[] = [];
    history = addToChatHistory(history, "Query", errorResponse);
    expect(history).toHaveLength(1);
  });

  it("should manage context window with token counting", () => {
    let history: ChatMessage[] = [];
    
    // Add several messages
    for (let i = 0; i < 5; i++) {
      history = addToChatHistory(
        history,
        `Question ${i} with some reasonable length`,
        `Answer ${i} that provides useful information about the topic`
      );
    }
    
    // Calculate tokens
    const tokens = calculateHistoryTokens(history);
    expect(tokens).toBeGreaterThan(0);
    
    // If too many tokens, we can get last N messages
    const recent = getLastMessages(history, 3);
    const recentTokens = calculateHistoryTokens(recent);
    expect(recentTokens).toBeLessThan(tokens);
  });
});
