import type { AbsoluteUrl } from '../../.pipeline/contracts/shared-types.js';

export type UrlValidationResult =
  | { type: 'success'; url: AbsoluteUrl }
  | { type: 'failure'; reason: string };

/**
 * Validates a URL using the WHATWG URL constructor.
 * Accepts only http: and https: schemes (ADR-005, AC-2, security NFR).
 */
export function validateUrl(input: unknown): UrlValidationResult {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    return { type: 'failure', reason: 'url must be a non-empty string' };
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { type: 'failure', reason: 'url must be an absolute http or https URL' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { type: 'failure', reason: 'url must be an absolute http or https URL' };
  }

  return { type: 'success', url: input as AbsoluteUrl };
}
