import { supabase } from "./supabase";
import type { Favorite } from "./supabase.types";

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
  return data as Favorite[];
}

export async function addFavorite(
  userId: string,
  contentType: "live" | "movie" | "series",
  contentId: number,
  title: string,
  poster: string
) {
  const existing = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .limit(1);

  if (existing.data && existing.data.length > 0) {
    return existing.data[0] as Favorite;
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert([{ user_id: userId, content_type: contentType, content_id: contentId, title, poster }])
    .select();

  if (error) {
    console.error("Error adding favorite:", error);
    return null;
  }
  return data ? data[0] as Favorite : null;
}

export async function removeFavorite(
  userId: string,
  contentType: "live" | "movie" | "series",
  contentId: number
) {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId);

  if (error) {
    console.error("Error removing favorite:", error);
    return false;
  }
  return true;
}

export async function isFavorite(
  userId: string,
  contentType: "live" | "movie" | "series",
  contentId: number
) {
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .limit(1);

  if (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
  return data && data.length > 0;
}
