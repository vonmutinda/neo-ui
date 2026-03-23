/**
 * After the HTTP `{ data: ... }` envelope unwrap, list endpoints may return either
 * a raw `T[]` or `PaginatedResult` (`{ data: T[], pagination }`).
 */
export function paginatedListFromResponse<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && "data" in res) {
    const inner = (res as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}
