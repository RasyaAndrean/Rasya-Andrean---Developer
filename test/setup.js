// Test setup file
import { beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

beforeEach(() => {
  // Reset DOM before each test
  document.body.innerHTML = '';
  
  // Reset localStorage mock
  vi.clearAllMocks();
  
  // Mock fetch for tests
  global.fetch = vi.fn();
});