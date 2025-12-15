/**
 * Unit tests for the Logger utility
 * 
 * What unit tests do:
 * - Test individual functions/components in ISOLATION
 * - Mock (fake) external dependencies like sockets, APIs, localStorage
 * - Run WITHOUT needing servers, databases, or the full app running
 * - Verify that code behaves correctly for various inputs
 * 
 * To run: yarn test
 */

// Tell Jest to replace the real socket with a fake one
// The real socket is a Socket.IO client, but we just need to mock the emit function
const mockEmit = jest.fn();
jest.mock('../src/socket/initsocket', () => ({
  __esModule: true,
  default: {
    emit: mockEmit,
    on: jest.fn(),
    off: jest.fn(),
    connected: true,
  },
}));

// Tell Jest to replace loggingConfig with a controllable mock
jest.mock('../src/utils/loggingConfig', () => ({
  isLoggingEnabled: jest.fn(() => true),
  setLoggingEnabled: jest.fn(),
}));

// Mock localStorage (browsers have this, but Jest/Node doesn't)
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {};
  }),
};
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

// Now import the modules AFTER mocking
import socket from '../src/socket/initsocket';
import { isLoggingEnabled } from '../src/utils/loggingConfig';
import { Logger, logEvent } from '../src/socket/logger';

// ============================================
// TEST SUITE
// ============================================

describe('Logger Utility', () => {
  
  // Runs before each individual test
  beforeEach(() => {
    // Clear all mock call history
    jest.clearAllMocks();
    
    // Set up localStorage with test values
    mockLocalStorage.store = {
      userId: 'test-user-123',
      studyId: 'study-456',
      sessionId: 'session-789',
    };
    
    // Make sure logging is enabled for tests
    (isLoggingEnabled as jest.Mock).mockReturnValue(true);
  });

  // ----------------------------------------
  // Test 1: Basic logEvent function
  // ----------------------------------------
  describe('logEvent()', () => {
    
    it('should emit event with correct structure', () => {
      // ACT: Call the function we're testing
      logEvent('test_event', { component: 'TestComponent', action: 'click' });

      // ASSERT: Check that socket.emit was called correctly
      expect(socket.emit).toHaveBeenCalledTimes(1);
      expect(socket.emit).toHaveBeenCalledWith(
        'log_event',
        expect.objectContaining({
          userId: 'test-user-123',
          studyId: 'study-456',
          eventName: 'test_event',
          eventData: { component: 'TestComponent', action: 'click' },
        })
      );
    });

    it('should NOT emit when logging is disabled', () => {
      // ARRANGE: Disable logging
      (isLoggingEnabled as jest.Mock).mockReturnValue(false);

      // ACT
      logEvent('test_event', { component: 'Test', action: 'test' });

      // ASSERT: socket.emit should NOT have been called
      expect(socket.emit).not.toHaveBeenCalled();
    });

    it('should include timestamp in event', () => {
      const beforeTime = Date.now();
      logEvent('test_event', { component: 'Test', action: 'test' });
      const afterTime = Date.now();

      // Get the actual call arguments
      const emitCall = (socket.emit as jest.Mock).mock.calls[0];
      const eventPayload = emitCall[1];

      // Timestamp should be between before and after
      expect(eventPayload.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(eventPayload.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  // ----------------------------------------
  // Test 2: Logger.logTableInteraction
  // ----------------------------------------
  describe('Logger.logTableInteraction()', () => {
    
    it('should prefix event name with "table_"', () => {
      Logger.logTableInteraction({
        component: 'SmartTable',
        action: 'rowClick',
        rowId: 'paper-123',
      });

      expect(socket.emit).toHaveBeenCalledWith(
        'log_event',
        expect.objectContaining({
          eventName: 'table_rowClick',
        })
      );
    });

    it('should include all table-specific data', () => {
      Logger.logTableInteraction({
        component: 'SmartTable',
        action: 'sortColumn',
        columnId: 'Year',
        sortDirection: 'desc',
        tableType: 'all',
      });

      expect(socket.emit).toHaveBeenCalledWith(
        'log_event',
        expect.objectContaining({
          eventData: expect.objectContaining({
            columnId: 'Year',
            sortDirection: 'desc',
            tableType: 'all',
          }),
        })
      );
    });
  });

  // ----------------------------------------
  // Test 3: Logger.logVisualizationInteraction
  // ----------------------------------------
  describe('Logger.logVisualizationInteraction()', () => {
    
    it('should prefix event name with "visualization_"', () => {
      Logger.logVisualizationInteraction({
        component: 'PaperScatter',
        action: 'select',
        selectedPoints: ['p1', 'p2'],
      });

      expect(socket.emit).toHaveBeenCalledWith(
        'log_event',
        expect.objectContaining({
          eventName: 'visualization_select',
        })
      );
    });
  });

  // ----------------------------------------
  // Test 4: Logger.logLLMInteraction
  // ----------------------------------------
  describe('Logger.logLLMInteraction()', () => {
    
    it('should log chat queries with correct structure', () => {
      Logger.logLLMInteraction({
        component: 'Dialog',
        action: 'chatQuery',
        query: 'Find HCI papers about LLMs',
      });

      expect(socket.emit).toHaveBeenCalledWith(
        'log_event',
        expect.objectContaining({
          eventName: 'llm_chatQuery',
          eventData: expect.objectContaining({
            query: 'Find HCI papers about LLMs',
          }),
        })
      );
    });
  });

  // ----------------------------------------
  // Test 5: Logger.logUIInteraction
  // ----------------------------------------
  describe('Logger.logUIInteraction()', () => {
    
    it('should log button clicks', () => {
      Logger.logUIInteraction({
        component: 'App',
        action: 'buttonClick',
        elementId: 'save-btn',
      });

      expect(socket.emit).toHaveBeenCalledWith(
        'log_event',
        expect.objectContaining({
          eventName: 'ui_buttonClick',
        })
      );
    });
  });
});

// ============================================
// What each part means:
// ============================================
// 
// describe('...', () => { ... })
//   - Groups related tests together
//   - Like a folder for tests
//
// it('should ...', () => { ... })
//   - A single test case
//   - Describes what the code SHOULD do
//
// expect(x).toBe(y)
//   - Assertion: "I expect x to equal y"
//   - If wrong, test FAILS
//
// jest.mock('...')
//   - Replaces a real module with a fake one
//   - Lets us test in isolation
//
// jest.fn()
//   - Creates a fake function that records calls
//   - We can check if it was called, with what args, etc.
//
