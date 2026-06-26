import type { Context } from 'hono';
import type { AbsoluteUrl } from '../../.pipeline/contracts/shared-types.js';

/**
 * Derives the short URL origin from the incoming request's Host/forwarded headers.
 * (ADR-005, Assumption A-3)
 *
 * Priority:
 * - Host: X-Forwarded-Host else Host header
 * - Protocol: X-Forwarded-Proto else 'https' when forwarded-host present else 'http'
 */
export function deriveShortUrl(c: Context, code: string): AbsoluteUrl {
  const forwardedHost = c.req.header('x-forwarded-host');
  const host = forwardedHost ?? c.req.header('host') ?? 'localhost';

  let proto: string;
  const forwardedProto = c.req.header('x-forwarded-proto');
  if (forwardedProto) {
    proto = forwardedProto;
  } else if (forwardedHost) {
    proto = 'https';
  } else {
    proto = 'http';
  }

  return `${proto}://${host}/${code}` as AbsoluteUrl;
}
