/**
 * Dialog/Chat Utility Functions
 * 
 * Pure functions for chat history management, input validation,
 * and response processing. Used by Dialog component and tested independently.
 */

// ============================================
// TYPES
// ============================================

export interface ChatMessage {
  human: string;
  ai: string;
}

export interface APIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================
// CHAT HISTORY FUNCTIONS
// ============================================

/**
 * Adds a new message to chat history
 * Maintains a rolling window of recent messages
 * @param currentHistory - Current chat history array
 * @param humanMessage - The user's message
 * @param aiResponse - The AI's response
 * @param maxMessages - Maximum messages to keep (default 10)
 * @returns New chat history array
 */
export function addToChatHistory(
  currentHistory: ChatMessage[],
  humanMessage: string,
  aiResponse: string,
  maxMessages: number = 10
): ChatMessage[] {
  const newMessage: ChatMessage = { human: humanMessage, ai: aiResponse };
  const newHistory = [...currentHistory, newMessage];
  
  // Keep only the last maxMessages
  if (newHistory.length > maxMessages) {
    return newHistory.slice(-maxMessages);
  }
  return newHistory;
}

/**
 * Formats chat history for API request
 * Converts internal format to OpenAI-style API format
 * @param history - Internal chat history
 * @returns Array of API-formatted messages
 */
export function formatHistoryForAPI(history: ChatMessage[]): APIMessage[] {
  const formatted: APIMessage[] = [];
  history.forEach(msg => {
    formatted.push({ role: 'user', content: msg.human });
    formatted.push({ role: 'assistant', content: msg.ai });
  });
  return formatted;
}

/**
 * Clears chat history
 * @returns Empty chat history array
 */
export function clearChatHistory(): ChatMessage[] {
  return [];
}

/**
 * Gets the last N messages from history
 * @param history - Chat history
 * @param count - Number of messages to get
 * @returns Last N messages
 */
export function getLastMessages(
  history: ChatMessage[],
  count: number
): ChatMessage[] {
  if (count <= 0) return [];
  return history.slice(-count);
}

// ============================================
// INPUT VALIDATION FUNCTIONS
// ============================================

/**
 * Validates chat input before sending
 * @param text - The input text to validate
 * @param maxLength - Maximum allowed length (default 2000)
 * @returns Validation result with valid flag and optional error
 */
export function validateChatInput(
  text: string | null | undefined,
  maxLength: number = 2000
): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Please enter a question' };
  }
  if (text.length > maxLength) {
    return { valid: false, error: `Question is too long (max ${maxLength} characters)` };
  }
  return { valid: true };
}

/**
 * Sanitizes user input
 * Removes potentially problematic characters
 * @param text - Raw input text
 * @returns Sanitized text
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';
  // Remove leading/trailing whitespace
  // Replace multiple spaces with single space
  return text.trim().replace(/\s+/g, ' ');
}

// ============================================
// RESPONSE PROCESSING FUNCTIONS
// ============================================

/**
 * Extracts paper titles from LLM response text
 * Papers are typically formatted as "**Paper Title**" in markdown
 * @param response - The LLM response text
 * @returns Array of extracted paper titles
 */
export function extractPaperTitlesFromResponse(response: string): string[] {
  const titles: string[] = [];
  
  // Match patterns like "**Paper Title**" (markdown bold)
  const boldPattern = /\*\*([^*]+)\*\*/g;
  let match;
  while ((match = boldPattern.exec(response)) !== null) {
    const title = match[1].trim();
    if (title.length > 3 && !titles.includes(title)) {
      titles.push(title);
    }
  }
  
  return titles;
}

/**
 * Truncates long responses for display/logging
 * @param response - The response text
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateResponse(
  response: string,
  maxLength: number = 500
): string {
  if (!response) return '';
  if (response.length <= maxLength) return response;
  return response.slice(0, maxLength) + '...';
}

/**
 * Checks if response indicates an error
 * @param response - The response text
 * @returns True if response appears to be an error
 */
export function isErrorResponse(response: string): boolean {
  if (!response) return false;
  const errorPatterns = [
    /error/i,
    /failed/i,
    /unable to/i,
    /cannot process/i,
    /exception/i,
    /timed? ?out/i,
  ];
  return errorPatterns.some(pattern => pattern.test(response));
}

/**
 * Checks if response is still loading/streaming
 * @param response - The response text
 * @returns True if response indicates loading state
 */
export function isLoadingResponse(response: string): boolean {
  if (!response) return false;
  const loadingPatterns = [
    /^running/i,
    /^loading/i,
    /^processing/i,
    /\.\.\.\s*$/,
  ];
  return loadingPatterns.some(pattern => pattern.test(response));
}

// ============================================
// STREAMING RESPONSE FUNCTIONS
// ============================================

/**
 * Accumulates streaming response chunks into a single string
 * @param chunks - Array of response chunks
 * @returns Accumulated response string
 */
export function accumulateStreamingResponse(chunks: string[]): string {
  return chunks.join('');
}

/**
 * Decodes a Uint8Array chunk to string
 * @param chunk - The raw chunk data
 * @returns Decoded string
 */
export function decodeChunk(chunk: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(chunk);
}

/**
 * Estimates token count for a message (rough approximation)
 * Used for context window management
 * @param text - The text to count tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

/**
 * Calculates total tokens in chat history
 * @param history - Chat history
 * @returns Total estimated tokens
 */
export function calculateHistoryTokens(history: ChatMessage[]): number {
  return history.reduce((total, msg) => {
    return total + estimateTokenCount(msg.human) + estimateTokenCount(msg.ai);
  }, 0);
}

// ============================================
// QUERY ENHANCEMENT FUNCTIONS
// ============================================

/**
 * Enhances a query with context from selected papers
 * @param query - Original query
 * @param selectedPaperTitles - Titles of selected papers for context
 * @returns Enhanced query string
 */
export function enhanceQueryWithContext(
  query: string,
  selectedPaperTitles: string[]
): string {
  if (!selectedPaperTitles || selectedPaperTitles.length === 0) {
    return query;
  }
  const context = `In the context of these papers: ${selectedPaperTitles.join(', ')}. `;
  return context + query;
}

/**
 * Checks if query is asking about specific papers
 * @param query - The query text
 * @returns True if query references papers
 */
export function isQueryAboutPapers(query: string): boolean {
  if (!query) return false;
  const paperPatterns = [
    /paper/i,
    /article/i,
    /study/i,
    /research/i,
    /publication/i,
    /author/i,
    /find|search|show/i,
  ];
  return paperPatterns.some(pattern => pattern.test(query));
}
