import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../src/app';

describe('GET /:code - Redirect', () => {
  beforeEach(() => {
    // Each test gets a fresh in-memory DB via environment setup
    process.env.DATABASE_PATH = ':memory:';
  });

  it('API-I-8: GET /:code for existing code → 302 with Location = original URL', async () => {
    // Create a link
    const originalUrl = 'https://example.com/some/very/long/path?with=query';
    const createResponse = await app.request('POST', '/api/links', {
      json: { url: originalUrl },
    });
    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    const code = created.code;

    // Follow the redirect
    const redirectResponse = await app.request('GET', `/${code}`);

    // Should return 302
    expect(redirectResponse.status).toBe(302);

    // Location header should be set to the original URL
    const locationHeader = redirectResponse.headers.get('location');
    expect(locationHeader).toBe(originalUrl);
  });

  it('API-I-9: GET /:code for unknown code → 404 {error:"LINK_NOT_FOUND"}', async () => {
    // Try to redirect to a non-existent code
    const redirectResponse = await app.request('GET', '/nonexistent');

    expect(redirectResponse.status).toBe(404);

    const body = await redirectResponse.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toBe('LINK_NOT_FOUND');
  });

  it('API-I-10: redirect increments clicks: stats clicks after GET /:code is exactly prior+1', async () => {
    // Create a link
    const url = 'https://example.com/test';
    const createResponse = await app.request('POST', '/api/links', {
      json: { url },
    });
    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    const code = created.code;

    // Get initial stats (should have 0 clicks)
    let statsResponse = await app.request('GET', `/api/links/${code}/stats`);
    let stats = await statsResponse.json();
    const initialClicks = stats.clicks;
    expect(initialClicks).toBe(0);

    // Follow the redirect
    const redirectResponse = await app.request('GET', `/${code}`);
    expect(redirectResponse.status).toBe(302);

    // Get stats again
    statsResponse = await app.request('GET', `/api/links/${code}/stats`);
    stats = await statsResponse.json();
    const clicksAfterRedirect = stats.clicks;

    // Clicks should have incremented by exactly 1
    expect(clicksAfterRedirect).toBe(initialClicks + 1);

    // Do another redirect
    const redirectResponse2 = await app.request('GET', `/${code}`);
    expect(redirectResponse2.status).toBe(302);

    // Get stats again
    statsResponse = await app.request('GET', `/api/links/${code}/stats`);
    stats = await statsResponse.json();
    const clicksAfterSecondRedirect = stats.clicks;

    // Clicks should have incremented by exactly 1 again
    expect(clicksAfterSecondRedirect).toBe(clicksAfterRedirect + 1);
  });
});
