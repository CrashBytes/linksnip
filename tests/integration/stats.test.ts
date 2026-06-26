import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../src/app';

describe('GET /api/links/:code/stats - Link Stats', () => {
  beforeEach(() => {
    // Each test gets a fresh in-memory DB via environment setup
    process.env.DATABASE_PATH = ':memory:';
  });

  it('API-I-6: GET /api/links/:code/stats for existing code → 200 {code,url,clicks}', async () => {
    // Create a link
    const url = 'https://example.com/test';
    const createResponse = await app.request('POST', '/api/links', {
      json: { url },
    });
    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    const code = created.code;

    // Get stats for the link
    const statsResponse = await app.request('GET', `/api/links/${code}/stats`);
    expect(statsResponse.status).toBe(200);

    const body = await statsResponse.json();
    expect(body).toHaveProperty('code');
    expect(body).toHaveProperty('url');
    expect(body).toHaveProperty('clicks');

    expect(body.code).toBe(code);
    expect(body.url).toBe(url);
    expect(body.clicks).toBe(0); // Initially zero clicks

    // clicks must be a non-negative integer
    expect(typeof body.clicks).toBe('number');
    expect(body.clicks).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(body.clicks)).toBe(true);
  });

  it('API-I-7: GET /api/links/:code/stats for unknown code → 404 {error:"LINK_NOT_FOUND"}', async () => {
    // Try to get stats for a non-existent code
    const statsResponse = await app.request('GET', '/api/links/nonexistent/stats');

    expect(statsResponse.status).toBe(404);

    const body = await statsResponse.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toBe('LINK_NOT_FOUND');
  });
});
