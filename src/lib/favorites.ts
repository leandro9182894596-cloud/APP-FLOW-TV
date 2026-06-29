import { apiRequest } from "./api";

export interface Favorite {
  id: string;
  userId: string;
  contentType: "live" | "movie" | "series";
  contentId: number;
  title: string;
  poster: string | null;
  createdAt: string;
}

export async function getFavorites(): Promise<Favorite[]> {
  return apiRequest<Favorite[]>("/favorites");
}

export async function addFavorite(
  contentType: "live" | "movie" | "series",
  contentId: number,
  title: string,
  poster: string
): Promise<Favorite> {
  return apiRequest<Favorite>("/favorites", {
    method: "POST",
    body: JSON.stringify({ contentType, contentId, title, poster }),
  });
}

export async function removeFavorite(
  contentType: "live" | "movie" | "series",
  contentId: number
): Promise<void> {
  return apiRequest(`/favorites/${contentType}/${contentId}`, {
    method: "DELETE",
  });
}

export async function isFavorite(
  contentType: "live" | "movie" | "series",
  contentId: number
): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some(
    (f) => f.contentType === contentType && f.contentId === contentId
  );
}
