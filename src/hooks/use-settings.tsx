import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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

  const { data, refetch } = useQuery<AppSettings>({
    queryKey: ["app-config"],
    initialData: localSettings,
    staleTime: 60 * 1000, // 1 minuto para não refetchar todo segundo
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
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

  // Refetch on mount to ensure we get the latest settings
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Never show loading screen — always use cached settings immediately
  return { settings: data ?? localSettings, isLoading: false };
}
