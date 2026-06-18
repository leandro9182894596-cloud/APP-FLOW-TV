import { useQuery } from "@tanstack/react-query";
import type { Account } from "./xtream";

const HOUR = 60 * 60 * 1000;
const CONTENT_CACHE_VERSION = "covers-v3";

/**
 * react-query cache without localStorage to prevent quota errors.
 */
export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { enabled?: boolean; maxAgeMs?: number },
) {
  return useQuery<T>({
    queryKey: [key],
    enabled: opts?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, // 30 minutes only
    queryFn: async () => {
      return fetcher();
    },
  });
}

export function accountKey(a: Account | null): string {
  if (!a) return "anon";
  return `${a.base}|${a.username}|${CONTENT_CACHE_VERSION}`;
}
