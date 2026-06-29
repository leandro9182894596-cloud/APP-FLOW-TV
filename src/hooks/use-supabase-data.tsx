import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  type Favorite,
} from "../lib/favorites";
import {
  getWatchHistory,
  saveWatchProgress,
  removeWatchProgress,
  type WatchHistory,
} from "../lib/history";
import { getAppSettings, saveAppSettings, type AppSetting } from "../lib/settings";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ["favorites", user?.id],
    queryFn: () => (user ? getFavorites() : []),
    enabled: !!user,
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
      if (!user) return null;
      return addFavorite(contentType, contentId, title, poster);
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
      if (!user) return false;
      return removeFavorite(contentType, contentId);
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery<WatchHistory[]>({
    queryKey: ["watchHistory", user?.id],
    queryFn: () => (user ? getWatchHistory() : []),
    enabled: !!user,
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
      if (!user) return null;
      return saveWatchProgress(
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
      if (!user) return false;
      return removeWatchProgress(contentType, contentId);
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

export function useAppSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings = null, isLoading } = useQuery<AppSetting | null>({
    queryKey: ["appSettings", user?.id],
    queryFn: () => (user ? getAppSettings() : null),
    enabled: !!user,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      if (!user) return null;
      return saveAppSettings(newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appSettings", user?.id] });
    },
  });

  return {
    settings,
    isLoading,
    saveSettings: saveSettingsMutation.mutate,
  };
}
