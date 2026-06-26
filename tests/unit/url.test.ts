import { describe, it, expect } from 'vitest';
import { validateUrl } from '../../src/lib/url';

describe('URL validation', () => {
  it('API-U-3: URL validator accepts http/https absolute URLs and rejects empty, missing, bare word, and non-http(s) schemes', () => {
    // Valid http URLs should pass
    const validHttpUrl = 'http://example.com';
    const resultHttpValid = validateUrl(validHttpUrl);
    expect(resultHttpValid).toBeDefined();
    expect(resultHttpValid?.type).toBe('success');

    // Valid https URLs should pass
    const validHttpsUrl = 'https://example.com/some/very/long/path?with=query';
    const resultHttpsValid = validateUrl(validHttpsUrl);
    expect(resultHttpsValid).toBeDefined();
    expect(resultHttpsValid?.type).toBe('success');

    // Empty string should fail
    const resultEmpty = validateUrl('');
    expect(resultEmpty?.type).toBe('failure');

    // Missing url (undefined) should fail
    const resultMissing = validateUrl(undefined as any);
    expect(resultMissing?.type).toBe('failure');

    // Bare word (no scheme) should fail
    const resultBareWord = validateUrl('example.com');
    expect(resultBareWord?.type).toBe('failure');

    // ftp scheme should fail
    const resultFtp = validateUrl('ftp://example.com');
    expect(resultFtp?.type).toBe('failure');

    // javascript scheme should fail
    const resultJavaScript = validateUrl('javascript:alert("xss")');
    expect(resultJavaScript?.type).toBe('failure');

    // data scheme should fail
    const resultData = validateUrl('data:text/html,<script>alert("xss")</script>');
    expect(resultData?.type).toBe('failure');
  });
});
