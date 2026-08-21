/* Test setup */

import '@testing-library/jest-dom';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    getLength: () => {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

/* matchMedia Mock */
const matchMediaMock = (query: string) => {
  return {
    matches: false,
    media: query,
    onchange: () => {
      return null;
    },
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  };
};

Object.defineProperty(globalThis, 'matchMedia', {
  value: matchMediaMock,
  writable: true,
});
