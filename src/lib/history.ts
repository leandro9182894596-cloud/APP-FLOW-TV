import { apiRequest } from "./api";

export interface WatchHistory {
  id: string;
  userId: string;
  contentType: "live" | "movie" | "series";
  contentId: number;
  episodeId: string | null;
  title: string;
  poster: string | null;
  position: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export async function getWatchHistory(limit = 40): Promise<WatchHistory[]> {
  return apiRequest<WatchHistory[]>("/history");
}

export async function saveWatchProgress(
  contentType: "movie" | "series",
  contentId: number,
  title: string,
  poster: string,
  position: number,
  duration: number,
  episodeId?: string
): Promise<WatchHistory | null> {
  if (position / duration > 0.95) {
    await apiRequest(`/history/${contentType}/${contentId}`, {
      method: "DELETE",
    });
    return null;
  }

  return apiRequest<WatchHistory>("/history", {
    method: "POST",
    body: JSON.stringify({
      contentType,
      contentId,
      episodeId,
      title,
      poster,
      position,
      duration,
    }),
  });
}

export async function removeWatchProgress(
  contentType: "movie" | "series",
  contentId: number
): Promise<void> {
  return apiRequest(`/history/${contentType}/${contentId}`, {
    method: "DELETE",
  });
}
