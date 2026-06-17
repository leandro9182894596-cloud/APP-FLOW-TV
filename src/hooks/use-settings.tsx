import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { loadSettings, saveSettings, type AppSettings } from "../lib/storage";
import { getConfig } from "../lib/config.functions";

/**
 * Global app appearance settings (logo, background, banner, DNS list).
 * Stored server-side so every user sees the same branding configured by the
 * admin. localStorage is used only as an instant-render cache.
 */
export function useSettings(): { settings: AppSettings; isLoading: boolean } {
  // Always use localStorage first for instant load
  const [localSettings, setLocalSettings] = useState<AppSettings>(() => {
    try {
      return loadSettings();
    } catch {
      return {};
    }
  });

  const { isLoading, data } = useQuery<AppSettings>({
    queryKey: ["app-config"],
    initialData: localSettings,
    staleTime: 30 * 1000, // 30s before refetching, makes it much faster
    refetchOnMount: true, // Still refetch on first mount to get latest
    refetchOnWindowFocus: false, // Disable to reduce unnecessary network calls
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Only refetch every 60s, not 15s
    queryFn: async () => {
      try {
        const cfg = await getConfig();
        const next: AppSettings = {
          logo: cfg.logo ?? undefined,
          background: cfg.background ?? undefined,
          banner: cfg.banner ?? undefined,
          bannerLink: cfg.bannerLink ?? undefined,
          banners: Array.isArray(cfg.banners) ? cfg.banners : undefined,
          dnsList: cfg.dnsList,
          paymentInfo: cfg.paymentInfo,
          paymentStatus: cfg.paymentStatus,
        };
        saveSettings(next);
        setLocalSettings(next);
        return next;
      } catch {
        // If server fetch fails, keep local settings
        return localSettings;
      }
    },
  });

  return { settings: data ?? localSettings, isLoading };
}
