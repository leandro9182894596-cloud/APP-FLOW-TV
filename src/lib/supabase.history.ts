import { supabase, useSupabase } from "./supabase";
import type { WatchHistory } from "./supabase.types";

export async function getWatchHistory(userId: string, limit = 40) {
  if (!useSupabase) return [];
  const { data, error } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching watch history:", error);
    return [];
  }
  return data as WatchHistory[];
}

export async function saveWatchProgress(
  userId: string,
  content_type: "movie" | "series",
  content_id: number,
  title: string,
  poster: string,
  position: number,
  duration: number,
  episode_id?: string
) {
  if (!useSupabase) return null;
  
  const existing = await supabase
    .from("watch_history")
    .select("id")
    .eq("user_id", userId)
    .eq("content_type", content_type)
    .eq("content_id", content_id)
    .maybeSingle();

  if (position / duration > 0.95) {
    if (existing.data) {
      await supabase.from("watch_history").delete().eq("id", existing.data.id);
    }
    return null;
  }

  const { data, error } = await supabase
    .from("watch_history")
    .upsert({
      user_id: userId,
      content_type,
      content_id,
      episode_id,
      title,
      poster,
      position,
      duration,
    })
    .select();

  if (error) {
    console.error("Error saving watch history:", error);
    return null;
  }
  return data ? data[0] as WatchHistory : null;
}

export async function removeWatchProgress(
  userId: string,
  content_type: "movie" | "series",
  content_id: number
) {
  if (!useSupabase) return false;
  
  const { error } = await supabase
    .from("watch_history")
    .delete()
    .eq("user_id", userId)
    .eq("content_type", content_type)
    .eq("content_id", content_id);

  if (error) {
    console.error("Error removing watch history:", error);
    return false;
  }
  return true;
}
