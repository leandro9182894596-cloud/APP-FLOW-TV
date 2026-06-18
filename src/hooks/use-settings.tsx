import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { loadSettings, saveSettings, type AppSettings, SETTINGS_EVENT } from "../lib/storage";
import { getConfig } from "../lib/config.functions";

/**
 * Global app appearance settings (logo, background, banner, DNS list).
 * Stored server-side so every user sees the same branding configured by the
 * admin. localStorage is used only as an instant-render cache.
 */
export function useSettings(): { settings: AppSettings; isLoading: boolean } {
  const queryClient = useQueryClient();
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Always use localStorage first for instant load
  const [localSettings, setLocalSettings] = useState<AppSettings>(() => {
    try {
      const settings = loadSettings();
      return {
        ...settings,
        dnsList: settings.dnsList || [],
      };
    } catch {
      return {
        dnsList: [],
      };
    }
  });

  const { data, isLoading: isQueryLoading } = useQuery<AppSettings>({
    queryKey: ["app-config"],
    initialData: localSettings,
    staleTime: 30 * 60 * 1000, // 30 minutos
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    queryFn: async () => {
      try {
        const cfg = await getConfig();
        const next: AppSettings = {
          logo: cfg.logo ?? undefined,
          background: cfg.background ?? undefined,
          banner: cfg.banner ?? undefined,
          bannerLink: cfg.bannerLink ?? undefined,
          banners: Array.isArray(cfg.banners) ? cfg.banners : undefined,
          dnsList: cfg.dnsList || [],
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

  // Listen for settings updates from the admin page
  useEffect(() => {
    const handleSettingsUpdate = () => {
      // Refresh local settings and update the query cache
      const newLocalSettings = loadSettings();
      setLocalSettings(newLocalSettings);
      queryClient.setQueryData(["app-config"], newLocalSettings);
    };

    window.addEventListener(SETTINGS_EVENT, handleSettingsUpdate);
    return () => window.removeEventListener(SETTINGS_EVENT, handleSettingsUpdate);
  }, [queryClient]);

  // Mark as loaded when first data comes in
  useEffect(() => {
    if (data && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [data, hasLoaded]);

  // Only show loading on FIRST load
  return {
    settings: data ?? localSettings,
    isLoading: !hasLoaded && isQueryLoading
  };
}
