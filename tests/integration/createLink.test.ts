import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../src/app';

describe('POST /api/links - Create Link', () => {
  beforeEach(() => {
    // Each test gets a fresh in-memory DB via environment setup
    process.env.DATABASE_PATH = ':memory:';
  });

  it('API-I-1: POST /api/links with valid URL → 201 with code (alphanumeric) and shortUrl ending /<code>', async () => {
    const response = await app.request('POST', '/api/links', {
      json: { url: 'https://example.com/some/very/long/path?with=query' },
    });

    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('code');
    expect(body).toHaveProperty('shortUrl');

    // code must match alphanumeric pattern
    expect(body.code).toMatch(/^[A-Za-z0-9]+$/);
    expect(body.code).toBeTruthy();

    // shortUrl must be an absolute URL ending with /<code>
    expect(body.shortUrl).toMatch(new RegExp(`/${body.code}$`));
    expect(body.shortUrl).toMatch(/^https?:\/\//);
  });

  it('API-I-2: POST /api/links with missing/empty/non-http(s) url → 400 {error:"INVALID_URL"}', async () => {
    // Missing url field
    const responseMissing = await app.request('POST', '/api/links', {
      json: {},
    });
    expect(responseMissing.status).toBe(400);
    const bodyMissing = await responseMissing.json();
    expect(bodyMissing.error).toBe('INVALID_URL');

    // Empty string
    const responseEmpty = await app.request('POST', '/api/links', {
      json: { url: '' },
    });
    expect(responseEmpty.status).toBe(400);
    const bodyEmpty = await responseEmpty.json();
    expect(bodyEmpty.error).toBe('INVALID_URL');

    // Non-http(s) scheme (ftp)
    const responseFtp = await app.request('POST', '/api/links', {
      json: { url: 'ftp://example.com' },
    });
    expect(responseFtp.status).toBe(400);
    const bodyFtp = await responseFtp.json();
    expect(bodyFtp.error).toBe('INVALID_URL');

    // Non-http(s) scheme (javascript)
    const responseJs = await app.request('POST', '/api/links', {
      json: { url: 'javascript:alert("xss")' },
    });
    expect(responseJs.status).toBe(400);
    const bodyJs = await responseJs.json();
    expect(bodyJs.error).toBe('INVALID_URL');

    // Non-http(s) scheme (data)
    const responseData = await app.request('POST', '/api/links', {
      json: { url: 'data:text/html,<script>alert("xss")</script>' },
    });
    expect(responseData.status).toBe(400);
    const bodyData = await responseData.json();
    expect(bodyData.error).toBe('INVALID_URL');

    // Bare word (no scheme)
    const responseBareSome = await app.request('POST', '/api/links', {
      json: { url: 'example.com' },
    });
    expect(responseBareSome.status).toBe(400);
    const bodyBareSome = await responseBareSome.json();
    expect(bodyBareSome.error).toBe('INVALID_URL');
  });

  it('API-I-3: POST /api/links twice with same URL → two different codes (A-4 no dedup)', async () => {
    const url = 'https://example.com/test-url';

    // First POST with the URL
    const response1 = await app.request('POST', '/api/links', {
      json: { url },
    });
    expect(response1.status).toBe(201);
    const body1 = await response1.json();
    const code1 = body1.code;

    // Second POST with the same URL
    const response2 = await app.request('POST', '/api/links', {
      json: { url },
    });
    expect(response2.status).toBe(201);
    const body2 = await response2.json();
    const code2 = body2.code;

    // The two codes must be different (no deduplication per A-4)
    expect(code1).not.toBe(code2);
  });
});
