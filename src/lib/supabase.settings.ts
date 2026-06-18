import { supabase } from "./supabase";
import type { AppSetting } from "./supabase.types";

export async function getAppSettings(userId: string) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching settings:", error);
    return null;
  }
  return data as AppSetting;
}

export async function saveAppSettings(
  userId: string,
  settings: Partial<AppSetting>
) {
  const existing = await getAppSettings(userId);

  const { data, error } = await supabase
    .from("settings")
    .upsert({ user_id: userId, ...settings })
    .select();

  if (error) {
    console.error("Error saving settings:", error);
    return null;
  }
  return data ? data[0] as AppSetting : null;
}
