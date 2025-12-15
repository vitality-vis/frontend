/**
 * Simplified Logger test to diagnose issues
 * Run with: yarn test SimpleLogger
 */

describe('Basic Jest functionality', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should pass a string test', () => {
    expect('hello').toBe('hello');
  });
});

describe('Mock testing', () => {
  it('should work with jest.fn()', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});
