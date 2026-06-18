import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "./use-supabase-auth";
import { useSupabase } from "../lib/supabase";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../lib/supabase.favorites";
import {
  getWatchHistory,
  saveWatchProgress,
  removeWatchProgress,
} from "../lib/supabase.history";
import {
  getDnsConnections,
  addDnsConnection,
  updateDnsConnection,
  deleteDnsConnection,
} from "../lib/supabase.dns";
import { getAppSettings, saveAppSettings } from "../lib/supabase.settings";
import { getProfile, updateProfile } from "../lib/supabase.profiles";

export function useFavorites() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => (user ? getFavorites(user.id) : []),
    enabled: !!user && useSupabase,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async ({
      contentType,
      contentId,
      title,
      poster,
    }: {
      contentType: "live" | "movie" | "series";
      contentId: number;
      title: string;
      poster: string;
    }) => {
      if (!user || !useSupabase) return null;
      return addFavorite(user.id, contentType, contentId, title, poster);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async ({
      contentType,
      contentId,
    }: {
      contentType: "live" | "movie" | "series";
      contentId: number;
    }) => {
      if (!user || !useSupabase) return false;
      return removeFavorite(user.id, contentType, contentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });

  return {
    favorites,
    isLoading,
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
  };
}

export function useWatchHistory() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["watchHistory", user?.id],
    queryFn: () => (user ? getWatchHistory(user.id) : []),
    enabled: !!user && useSupabase,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (data: {
      contentType: "movie" | "series";
      contentId: number;
      title: string;
      poster: string;
      position: number;
      duration: number;
      episodeId?: string;
    }) => {
      if (!user || !useSupabase) return null;
      return saveWatchProgress(
        user.id,
        data.contentType,
        data.contentId,
        data.title,
        data.poster,
        data.position,
        data.duration,
        data.episodeId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchHistory", user?.id] });
    },
  });

  const removeProgressMutation = useMutation({
    mutationFn: async ({
      contentType,
      contentId,
    }: {
      contentType: "movie" | "series";
      contentId: number;
    }) => {
      if (!user || !useSupabase) return false;
      return removeWatchProgress(user.id, contentType, contentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchHistory", user?.id] });
    },
  });

  return {
    history,
    isLoading,
    saveProgress: saveProgressMutation.mutate,
    removeProgress: removeProgressMutation.mutate,
  };
}

export function useDnsConnections() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: dnsConnections = [], isLoading } = useQuery({
    queryKey: ["dnsConnections", user?.id],
    queryFn: () => (user ? getDnsConnections(user.id) : []),
    enabled: !!user && useSupabase,
  });

  const addDnsMutation = useMutation({
    mutationFn: async ({
      dnsUrl,
      username,
      password,
    }: {
      dnsUrl: string;
      username: string;
      password: string;
    }) => {
      if (!user || !useSupabase) return null;
      return addDnsConnection(user.id, dnsUrl, username, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dnsConnections", user?.id] });
    },
  });

  const updateDnsMutation = useMutation({
    mutationFn: async ({
      id,
      dnsUrl, username, password
    }: {
      id: string;
      dnsUrl: string;
      username: string;
      password: string;
    }) => {
      if (!user || !useSupabase) return null;
      return updateDnsConnection(id, dnsUrl, username, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dnsConnections", user?.id] });
    },
  });

  const deleteDnsMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!user || !useSupabase) return false;
      return deleteDnsConnection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dnsConnections", user?.id] });
    },
  });

  return {
    dnsConnections, isLoading,
    addDns: addDnsMutation.mutate,
    updateDns: updateDnsMutation.mutate,
    deleteDns: deleteDnsMutation.mutate,
  };
}

export function useAppSettings() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: settings = null, isLoading } = useQuery({
    queryKey: ["appSettings", user?.id],
    queryFn: () => (user ? getAppSettings(user.id) : null),
    enabled: !!user && useSupabase,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      if (!user || !useSupabase) return null;
      return saveAppSettings(user.id, newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appSettings", user?.id] });
    },
  });

  return {
    settings, isLoading,
    saveSettings: saveSettingsMutation.mutate,
  };
}

export function useProfile() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => (user ? getProfile(user.id) : null),
    enabled: !!user && useSupabase,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!user || !useSupabase) return null;
      return updateProfile(user.id, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return {
    profile, isLoading,
    updateProfile: updateProfileMutation.mutate,
  };
}
