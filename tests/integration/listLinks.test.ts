import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../src/app';

describe('GET /api/links - List Links', () => {
  beforeEach(() => {
    // Each test gets a fresh in-memory DB via environment setup
    process.env.DATABASE_PATH = ':memory:';
  });

  it('API-I-4: GET /api/links → 200 array; each item has code, url, clicks (non-negative int)', async () => {
    // First create a link
    const createResponse = await app.request('POST', '/api/links', {
      json: { url: 'https://example.com/test' },
    });
    expect(createResponse.status).toBe(201);

    // Then list all links
    const listResponse = await app.request('GET', '/api/links');
    expect(listResponse.status).toBe(200);

    const body = await listResponse.json();
    expect(Array.isArray(body)).toBe(true);

    // Each item should have code, url, and clicks
    expect(body.length).toBeGreaterThan(0);
    body.forEach((link: any) => {
      expect(link).toHaveProperty('code');
      expect(link).toHaveProperty('url');
      expect(link).toHaveProperty('clicks');

      // clicks must be a non-negative integer
      expect(typeof link.clicks).toBe('number');
      expect(link.clicks).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(link.clicks)).toBe(true);
    });
  });

  it('API-I-5: GET /api/links reflects links created by prior POSTs in same session', async () => {
    // Initially, the list should be empty
    let listResponse = await app.request('GET', '/api/links');
    let body = await listResponse.json();
    expect(body).toEqual([]);

    // Create first link
    const url1 = 'https://example.com/first';
    const createResponse1 = await app.request('POST', '/api/links', {
      json: { url: url1 },
    });
    expect(createResponse1.status).toBe(201);
    const created1 = await createResponse1.json();

    // List should now include the first link
    listResponse = await app.request('GET', '/api/links');
    body = await listResponse.json();
    expect(body.length).toBe(1);
    expect(body[0].code).toBe(created1.code);
    expect(body[0].url).toBe(url1);

    // Create second link
    const url2 = 'https://example.com/second';
    const createResponse2 = await app.request('POST', '/api/links', {
      json: { url: url2 },
    });
    expect(createResponse2.status).toBe(201);
    const created2 = await createResponse2.json();

    // List should now include both links
    listResponse = await app.request('GET', '/api/links');
    body = await listResponse.json();
    expect(body.length).toBe(2);

    const codes = body.map((link: any) => link.code);
    expect(codes).toContain(created1.code);
    expect(codes).toContain(created2.code);

    const urls = body.map((link: any) => link.url);
    expect(urls).toContain(url1);
    expect(urls).toContain(url2);
  });
});
