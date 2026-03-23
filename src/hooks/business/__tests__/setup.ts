export {
  setupAuth,
  clearAuth,
  createWrapper,
  mockFetchSuccess,
  mockFetchError,
  expectApiCall,
  expectApiCallBody,
  expectIdempotencyKey,
  renderHook,
  waitFor,
} from "../../__tests__/setup";

import { vi } from "vitest";

export const TEST_BUSINESS_ID = "biz-uuid-1";
export const TEST_BIZ_ID = TEST_BUSINESS_ID;

export function mockFetchPaginated(
  data: unknown[],
  total: number,
  limit = 20,
  offset = 0,
) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        data,
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      }),
    text: () => Promise.resolve(JSON.stringify({ data })),
    headers: new Headers(),
  });
}
