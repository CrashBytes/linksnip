import { describe, it, expect } from 'vitest';
import { generateCode } from '../../src/lib/code';

describe('Code generation', () => {
  it('API-U-1: generated code is non-empty and matches ^[A-Za-z0-9]+$', () => {
    const code = generateCode();

    expect(code).toBeTruthy();
    expect(code).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('API-U-2: generated codes are unique across many generations (no dup in N draws)', () => {
    const codes = new Set<string>();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      codes.add(generateCode());
    }

    // All 1000 codes should be unique (no duplicates)
    expect(codes.size).toBe(iterations);
  });
});
