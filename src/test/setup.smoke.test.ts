import { describe, it, expect } from 'vitest';

describe('test infra', () => {
  it('jsdom + indexedDB + OffscreenCanvas all wired', () => {
    expect(typeof window).toBe('object');
    expect(typeof indexedDB).toBe('object');
    expect(typeof OffscreenCanvas).toBe('function');
    expect(typeof createImageBitmap).toBe('function');
  });
});
