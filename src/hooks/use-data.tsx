import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { api } from "../lib/api";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await api.getFavorites();
      return response.data || [];
    },
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
      poster?: string;
    }) => {
      if (!user) return null;
      return api.createFavorite({ contentType, contentId, title, poster });
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
      return api.deleteFavorite(contentType, contentId);
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

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["watchHistory", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await api.getHistory();
      return response.data || [];
    },
    enabled: !!user,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (data: {
      contentType: "movie" | "series";
      contentId: number;
      title: string;
      poster?: string;
      position: number;
      duration: number;
      episodeId?: string;
    }) => {
      if (!user) return null;
      return api.upsertHistory(data);
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
      return api.deleteHistoryItem(contentType, contentId);
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: dnsConnections = [], isLoading } = useQuery({
    queryKey: ["dnsConnections", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await api.getDnsConnections();
      return response.data || [];
    },
    enabled: !!user,
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
      if (!user) return null;
      return api.createDnsConnection({ dnsUrl, username, password });
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
      if (!user) return null;
      return api.updateDnsConnection(id, { dnsUrl, username, password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dnsConnections", user?.id] });
    },
  });

  const deleteDnsMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!user) return false;
      return api.deleteDnsConnection(id);
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings = null, isLoading } = useQuery({
    queryKey: ["appSettings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await api.getSettings();
      return response.data;
    },
    enabled: !!user,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      if (!user) return null;
      return api.updateSettings(newSettings);
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await api.getProfile();
      return response.data;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) return null;
      return api.updateProfile(profileData);
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
