import { useQuery } from "@tanstack/react-query";
import type { Account } from "./xtream";

const HOUR = 60 * 60 * 1000;
const CONTENT_CACHE_VERSION = "covers-v3";

/**
 * react-query ONLY (NO localStorage) to prevent storage quota issues.
 * Data stays in memory for the session only - no persistent caching for large content.
 */
export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { enabled?: boolean; maxAgeMs?: number },
) {
  return useQuery<T>({
    queryKey: [key],
    enabled: opts?.enabled ?? true,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 1 * HOUR, // 1 hour only
    queryFn: async () => {
      return fetcher();
    },
  });
}

export function accountKey(a: Account | null): string {
  if (!a) return "anon";
  return `${a.base}|${a.username}|${CONTENT_CACHE_VERSION}`;
}
