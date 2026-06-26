import type { ApiErrorCode } from '../../.pipeline/contracts/shared-types.js';

/**
 * Application error class carrying a stable API error code and HTTP status.
 * Used by route handlers; mapped to wire format by the central onError in app.ts.
 */
export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    public readonly httpStatus: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function invalidUrl(message = 'url must be an absolute http or https URL'): ApiError {
  return new ApiError('INVALID_URL', 400, message);
}

export function linkNotFound(code: string): ApiError {
  return new ApiError('LINK_NOT_FOUND', 404, `no link exists for code '${code}'`);
}
